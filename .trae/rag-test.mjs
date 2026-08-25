// RAG citations 冒烟测试（用后即删）
const BASE = 'http://127.0.0.1:3000/api';
let pass = 0, fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`PASS | ${name}`); }
  else { fail++; console.log(`FAIL | ${name} | ${detail}`); }
};

async function askSSE(token, question) {
  const r = await fetch(`${BASE}/miniapp/agent/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question, history: [] }),
  });
  const text = await r.text();
  const events = [];
  for (const block of text.split('\n\n')) {
    for (const line of block.split('\n')) {
      const t = line.trim();
      if (t.startsWith('data:')) {
        try { events.push(JSON.parse(t.slice(5).trim())); } catch {}
      }
    }
  }
  return { status: r.status, events };
}

const login = await fetch(`${BASE}/miniapp/auth/wechat-login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: `rag-test-${Date.now()}`, nickname: 'RagTester' }),
}).then((x) => x.json());
const token = login.accessToken;
check('登录获取 token', !!token, JSON.stringify(login).slice(0, 120));

// 1. 布依相关问题：应有 citations 事件且为首个事件，最多 3 条
const r1 = await askSSE(token, "布依语的'水'怎么说");
const types = r1.events.map((e) => e.type).join(',');
const cit = r1.events.find((e) => e.type === 'citations');
check('布依问题返回 citations 事件', !!cit, `types=${types}`);
check('citations 是首个 SSE 事件', r1.events[0]?.type === 'citations', `first=${r1.events[0]?.type}`);
check('citations 最多 3 条（新逻辑）', Array.isArray(cit?.items) && cit.items.length <= 3, `count=${cit?.items?.length}`);
if (Array.isArray(cit?.items) && cit.items.length) {
  const it = cit.items[0];
  check('引用条目含必要字段', typeof it.ref === 'number' && typeof it.id === 'number' && !!it.buyiText && !!it.zhText && typeof it.brief === 'string', JSON.stringify(it).slice(0, 200));
  check('引用条目无敏感字段', !('passwordHash' in it) && !('phoneNumber' in it), JSON.stringify(Object.keys(it)));
}
const full1 = r1.events.filter((e) => e.type === 'delta').map((e) => e.content).join('');
check('回答正文不含 [n] 角标（新提示词）', !/\[\d{1,2}\]/.test(full1), `answer=${full1.slice(0, 80)}`);
check('回答以 delta 流式返回', r1.events.some((e) => e.type === 'delta'), `types=${types}`);
check('以 done 事件结束', r1.events.some((e) => e.type === 'done'), `types=${types}`);

// 2. 无关问题：不应有 citations（isProjectRelated 闸门）
const r2 = await askSSE(token, '今天股票行情怎么样');
check('无关问题无 citations 事件', !r2.events.some((e) => e.type === 'citations'), `types=${r2.events.map((e) => e.type).join(',')}`);
check('无关问题仍正常回答', r2.events.some((e) => e.type === 'done'), `types=${r2.events.map((e) => e.type).join(',')}`);

// 3. 未登录：401（鉴权未因改动破坏）
const r3 = await fetch(`${BASE}/miniapp/agent/ask`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: '布依族节日', history: [] }),
});
check('未登录访问 ask 被拒绝(401)', r3.status === 401 || r3.status === 403, `status=${r3.status}`);

// 4. SQL 注入尝试：恶意关键字应被参数化查询安全处理，不报 500
const r4 = await askSSE(token, "布依语' OR 1=1-- 是什么");
check('注入式问题不引发服务错误', r4.events.some((e) => e.type === 'done' || e.type === 'delta'), `types=${r4.events.map((e) => e.type).join(',')} status=${r4.status}`);

console.log(`\nSUMMARY | pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
