const BASE = 'http://127.0.0.1:3000/api';
let pass = 0, fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`PASS | ${name}`); }
  else { fail++; console.log(`FAIL | ${name} | ${detail}`); }
};
const get = async (p) => (await fetch(BASE + p)).json();
const post = async (p, body, hdr) => {
  const r = await fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(hdr || {}) }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
};

(async () => {
  // ===== 1. 搜索排序（核心修复：搜"吃"）=====
  const r = await get(`/miniapp/search?keyword=${encodeURIComponent('吃')}`);
  const dict = r.dictionary || [];
  check("搜索'吃'返回结果>0", dict.length > 0, `count=${dict.length}`);
  console.log(`INFO | 前5条: ${dict.slice(0, 5).map((x) => `${x.buyiText}=${x.zhText}`).join(', ')}`);
  const genlIdx = dict.findIndex((x) => x.buyiText === 'genl');
  const xooIdx = dict.findIndex((x) => x.buyiText === 'xoongh');
  check('genl(吃)出现在结果中', genlIdx >= 0, `index=${genlIdx}`);
  check('xoongh(饭)排在genl之后或不在结果', xooIdx < 0 || xooIdx > genlIdx, `genl=${genlIdx} xoongh=${xooIdx}`);

  const rank = (item, kw) => {
    const zh = (item.zhText || '').toLowerCase();
    const by = (item.buyiText || '').toLowerCase();
    const en = (item.enText || '').toLowerCase();
    const de = (item.description || '').toLowerCase();
    if (zh === kw) return 0;
    if (zh.startsWith(kw) || by === kw) return 1;
    if (zh.includes(kw) || by.startsWith(kw)) return 2;
    if (by.includes(kw)) return 3;
    if (en.includes(kw)) return 4;
    if (de.includes(kw)) return 5;
    return 6;
  };
  const kw = '吃';
  const scores = dict.map((x) => rank(x, kw));
  let monotonic = true;
  for (let i = 1; i < scores.length; i++) if (scores[i] < scores[i - 1]) monotonic = false;
  check("搜索'吃'结果按相关性单调不减排序", monotonic, `scores=${scores.join(',')}`);
  const zhHit = dict.filter((x) => (x.zhText || '').includes(kw)).length;
  console.log(`INFO | 汉义含'吃'的条目数=${zhHit}，总结果=${dict.length}`);
  // 短语/谚语本体含关键字必须能搜出（产品规则）
  const phraseHit = (r.phrases || []).filter((x) => (x.zhText || '').includes(kw) || (x.buyiText || '').includes(kw));
  check("搜'吃'短语本体命中>0", phraseHit.length > 0, `count=${phraseHit.length}`);
  const proverbHit = (r.proverbs || []).filter((x) => (x.zhText || '').includes(kw) || (x.buyiText || '').includes(kw));
  check("搜'吃'谚语本体命中>0", proverbHit.length > 0, `count=${proverbHit.length}`);
  // 词典不匹配 description：除 genl 外不应出现仅例句含'吃'的词条
  const dictDescOnly = dict.filter((x) => !(x.zhText || '').includes(kw) && !(x.buyiText || '').toLowerCase().includes(kw) && !(x.enText || '').toLowerCase().includes(kw));
  check("词典不命中仅例句含'吃'的词条", dictDescOnly.length === 0, JSON.stringify(dictDescOnly.map((x) => x.buyiText)));

  // ===== 2. 发音闯关 questions =====
  const q = await get('/miniapp/pronunciation/questions?count=5');
  const qItems = q.items || q || [];
  console.log(`INFO | questions 结构: ${JSON.stringify(q).slice(0, 240)}`);
  check('发音题返回5题', Array.isArray(qItems) ? qItems.length === 5 : false, `count=${Array.isArray(qItems) ? qItems.length : 'not-array'}`);
  const q3 = await get('/miniapp/pronunciation/questions?count=3');
  const q3Items = q3.items || q3 || [];
  check('count=3 返回3题', Array.isArray(q3Items) && q3Items.length === 3, `count=${q3Items.length}`);
  if (Array.isArray(qItems) && qItems.length) {
    const q1 = qItems[0];
    check('发音题含 buyiText/zhText', !!(q1.buyiText && q1.zhText), JSON.stringify(q1).slice(0, 120));
  }

  // ===== 3. 发音评分 score（契约: targetText=布依文, recognizedText=汉字）=====
  const s1 = await post('/miniapp/pronunciation/score', { targetText: 'na', recognizedText: '那' });
  console.log(`INFO | 精确匹配: ${JSON.stringify(s1.data)}`);
  check('精确匹配得100分', s1.status === 201 && s1.data.score === 100, `status=${s1.status} data=${JSON.stringify(s1.data)}`);
  const s2 = await post('/miniapp/pronunciation/score', { targetText: 'mang bai rux', recognizedText: '芒摆如' });
  console.log(`INFO | 部分匹配: ${JSON.stringify(s2.data)}`);
  check('部分匹配得分介于1-99', s2.status === 201 && s2.data.score > 0 && s2.data.score < 100, `data=${JSON.stringify(s2.data)}`);
  const s2b = await post('/miniapp/pronunciation/score', { targetText: 'gan cau', recognizedText: '吃饭' });
  check('完全不同得0分', s2b.status === 201 && s2b.data.score === 0, `data=${JSON.stringify(s2b.data)}`);
  const s3 = await post('/miniapp/pronunciation/score', { targetText: 'na', recognizedText: '' });
  check('空识别文本得0分且不报错', s3.status === 201 && s3.data.score === 0 && s3.data.feedback === '没有听清，请再试一次', `status=${s3.status} data=${JSON.stringify(s3.data)}`);
  const s4 = await post('/miniapp/pronunciation/score', { targetText: ' Na, Gau! ', recognizedText: '那高' });
  check('目标文本去标点转小写后切分', s4.status === 201 && JSON.stringify(s4.data.targetSyllables) === '["na","gau"]', `data=${JSON.stringify(s4.data)}`);

  // ===== 4. Quiz 发音模式 =====
  const login = await post('/miniapp/auth/wechat-login', { code: `test-${Date.now()}`, nickname: 'Tester' });
  const token = login.data && login.data.accessToken;
  check('Mock 登录获取 token', !!token, `status=${login.status}`);
  const hdr = { Authorization: `Bearer ${token}` };

  // 校验规则: score = points 总和(10+8+5=23), correctCount = points>=6 的题数(2)
  const a1 = await post('/miniapp/quiz-attempts', {
    mode: 'pronunciation', score: 23, correctCount: 2, totalQuestions: 3,
    answers: [
      { id: 'p1', recognizedText: 'Mengz ndil', buyiText: 'Mengz ndil', zhText: '你好', points: 10 },
      { id: 'p2', recognizedText: 'gul', buyiText: 'gul', zhText: '我', points: 8 },
      { id: 'p3', recognizedText: 'x', buyiText: 'weanl', zhText: '歌', points: 5 },
    ],
  }, hdr);
  check('发音模式提交成功且 mode 回显', a1.status === 201 && a1.data.mode === 'pronunciation', `status=${a1.status} data=${JSON.stringify(a1.data)}`);
  check('发音模式返回分数', a1.data && a1.data.score === 23, `score=${a1.data && a1.data.score}`);
  const ans = (a1.data && a1.data.answers) || [];
  const a3ans = ans.find((x) => x.id === 'p2') || {};
  check('发音明细保留 recognizedText/buyiText/points', a3ans.recognizedText === 'gul' && a3ans.buyiText === 'gul' && a3ans.points === 8, JSON.stringify(a3ans));

  const bad = await post('/miniapp/quiz-attempts', {
    mode: 'pronunciation', score: 50, correctCount: 1, totalQuestions: 1,
    answers: [{ id: 'p1', points: 15 }],
  }, hdr);
  check('非法 points>10 被拒绝(400)', bad.status === 400, `status=${bad.status} data=${JSON.stringify(bad.data)}`);

  const badScore = await post('/miniapp/quiz-attempts', {
    mode: 'pronunciation', score: 999, correctCount: 1, totalQuestions: 1,
    answers: [{ id: 'p1', points: 10 }],
  }, hdr);
  check('非法总分被拒绝(400)', badScore.status === 400, `status=${badScore.status}`);

  const a3 = await post('/miniapp/quiz-attempts', {
    mode: 'culture', score: 10, correctCount: 1, totalQuestions: 1,
    answers: [{ id: 'q1', selected: 'A', answer: 'A', correct: true }],
  }, hdr);
  check('文化模式提交回归正常', a3.status === 201 && a3.data.mode === 'culture', `status=${a3.status} data=${JSON.stringify(a3.data)}`);

  const list = await fetch(`${BASE}/miniapp/quiz-attempts?page=1&pageSize=10`, { headers: hdr }).then((x) => x.json());
  const listItems = list.items || [];
  check('成绩列表返回记录>=2', listItems.length >= 2, `count=${listItems.length}`);
  check('成绩列表含 mode 字段', listItems.every((x) => x.mode === 'culture' || x.mode === 'pronunciation'), JSON.stringify(listItems.map((x) => x.mode)));

  // ===== 4.5 不带 mode 的旧客户端提交（向后兼容）=====
  const legacy = await post('/miniapp/quiz-attempts', {
    score: 20, correctCount: 2, totalQuestions: 2,
    answers: [
      { id: 'q1', selected: 'A', answer: 'A', correct: true },
      { id: 'q2', selected: 'B', answer: 'B', correct: true },
    ],
  }, hdr);
  check('旧客户端不传 mode 仍可提交(缺省culture)', legacy.status === 201 && legacy.data.mode === 'culture', `status=${legacy.status} data=${JSON.stringify(legacy.data)}`);

  // ===== 5. 浏览分页 =====
  const d1 = await get('/miniapp/dictionary?page=1&pageSize=20');
  check('词典分页第1页20条', d1.items && d1.items.length === 20, `count=${d1.items && d1.items.length}`);
  check('词典分页total>0', d1.total > 0, `total=${d1.total}`);
  check('totalPages=ceil(total/20)', d1.totalPages === Math.ceil(d1.total / 20), `tp=${d1.totalPages}`);
  const d2 = await get('/miniapp/dictionary?page=2&pageSize=20');
  const ids1 = new Set(d1.items.map((x) => x.id));
  const overlap = d2.items.filter((x) => ids1.has(x.id));
  check('第1/2页无重复条目', overlap.length === 0, `overlap=${overlap.map((x) => x.id).join(',')}`);
  const p1 = await get('/miniapp/phrases?page=1&pageSize=100');
  const pv = await get('/miniapp/proverbs?page=1&pageSize=100');
  console.log(`INFO | dictionary=${d1.total} phrases=${p1.total} proverbs=${pv.total}`);

  // ===== 6. suggest 联想（回归，正确路由 /miniapp/search/suggest）=====
  const sg = await get(`/miniapp/search/suggest?keyword=${encodeURIComponent('吃')}`);
  const sgCount = (sg.dictionary || []).length;
  check("联想'吃'返回建议", sgCount > 0, `count=${sgCount} resp=${JSON.stringify(sg).slice(0, 150)}`);
  const sgGenl = (sg.dictionary || []).some((x) => x.buyiText === 'genl');
  check("联想'吃'含 genl", sgGenl, JSON.stringify((sg.dictionary || []).slice(0, 3)));

  console.log(`\nSUMMARY | pass=${pass} fail=${fail}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
