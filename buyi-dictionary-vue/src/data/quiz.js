const source = '中国非物质文化遗产网'

export const quizBank = [
  {
    id: 'drum-type',
    prompt: '“铜鼓十二调”在非遗名录中属于哪一类别？',
    answer: '传统音乐',
    options: ['传统音乐', '传统美术', '民俗', '曲艺'],
    explanation: '中国非遗网将“铜鼓十二调”列为传统音乐项目。',
    source
  },
  {
    id: 'drum-province',
    prompt: '“铜鼓十二调”的所属地区是？',
    answer: '贵州省',
    options: ['贵州省', '云南省', '广西壮族自治区', '四川省'],
    explanation: '该项目由贵州省镇宁布依族苗族自治县申报。',
    source
  },
  {
    id: 'drum-material',
    prompt: '布依铜鼓主要用什么材质铸造？',
    answer: '青铜',
    options: ['青铜', '木材', '陶土', '竹材'],
    explanation: '资料说明布依铜鼓以青铜铸造。',
    source
  },
  {
    id: 'dou-origin',
    prompt: '斗纹布图案的灵感来源于什么器具？',
    answer: '盛装粮食的“斗”',
    options: ['盛装粮食的“斗”', '铜鼓', '织布梭', '染缸'],
    explanation: '斗纹布以盛粮器具“斗”为灵感。',
    source
  },
  {
    id: 'dou-meaning',
    prompt: '斗纹布常表达的祝福更接近哪一项？',
    answer: '五谷丰登、平安幸福',
    options: ['五谷丰登、平安幸福', '远航贸易', '武艺竞赛', '山林狩猎'],
    explanation: '相关资料将斗纹布与丰收、勤劳、团结、平安和幸福相连。',
    source
  },
  {
    id: 'clothing-colors',
    prompt: '布依族服饰常见的色调组合是？',
    answer: '蓝、青、白',
    options: ['蓝、青、白', '紫、金、黑', '红、绿、银', '黄、粉、灰'],
    explanation: '中国非遗网描述其服饰偏好蓝、青、白等色调。',
    source
  },
  {
    id: 'clothing-process',
    prompt: '下列哪项属于布依族服饰制作中包含的传统技艺？',
    answer: '织锦',
    options: ['织锦', '玻璃吹制', '瓷器烧窑', '木版印刷'],
    explanation: '资料列举了纺织、印染、挑花、刺绣、蜡染、织锦等技艺。',
    source
  },
  {
    id: 'clothing-identity',
    prompt: '布依族服饰除了穿着功能，还承载什么？',
    answer: '族群记忆与民俗文化',
    options: ['族群记忆与民俗文化', '股票交易信息', '航海路线', '工业标准'],
    explanation: '服饰被视为研究生产生活、文化习俗和信仰的重要文化载体。',
    source
  },
  {
    id: 'drum-use',
    prompt: '铜鼓十二调常出现在哪些场景？',
    answer: '庆典、祭祖与祭祀',
    options: ['庆典、祭祖与祭祀', '考试与招聘', '田间灌溉', '城市交通'],
    explanation: '资料指出其与庆典、祭祖、祭祀等仪式相关。',
    source
  },
  {
    id: 'piano-label',
    prompt: '文化页“声调钢琴”的声音应理解为？',
    answer: '调值轮廓示意',
    options: ['调值轮廓示意', '真实录音替代', '歌曲伴奏', '语音识别结果'],
    explanation: '该交互使用合成音展示高低与升降，不冒充真实示例词录音。',
    source: '布依词典数字文化馆'
  },
  {
    id: 'piano-shortcut',
    prompt: '聚焦声调钢琴后，哪组按键可选择对应声调？',
    answer: '数字 1–6',
    options: ['数字 1–6', '字母 A–F', '方向键', '空格键'],
    explanation: '键盘快捷操作与六个琴键一一对应。',
    source: '布依词典数字文化馆'
  },
  {
    id: 'player-fallback',
    prompt: '民歌播放器网络音源不可用时会怎样？',
    answer: '切换到随前端发布的本地音频',
    options: ['切换到随前端发布的本地音频', '继续模拟进度', '显示固定时长', '自动退出页面'],
    explanation: '播放器提供本地音频回退，保证比赛离线演示。',
    source: '布依词典数字文化馆'
  }
]

export function shuffle(items, random = Math.random) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function createQuizRound(size = 10, random = Math.random) {
  return shuffle(quizBank, random)
    .slice(0, size)
    .map(question => ({ ...question, options: shuffle(question.options, random) }))
}

export function scoreAnswers(answers) {
  return answers.filter(answer => answer.correct).length * 10
}

