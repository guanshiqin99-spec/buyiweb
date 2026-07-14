const { quizApi } = require('../../utils/api');
const { syncAppearance } = require('../../utils/view');

const QUIZ_BANK = [
  { id: 'drum-type', prompt: '“铜鼓十二调”属于哪一类别？', answer: '传统音乐', options: ['传统音乐', '传统美术', '民俗', '曲艺'], explanation: '“铜鼓十二调”被列为传统音乐项目。' },
  { id: 'drum-province', prompt: '“铜鼓十二调”的所属地区是？', answer: '贵州省', options: ['贵州省', '云南省', '广西壮族自治区', '四川省'], explanation: '该项目由贵州省镇宁布依族苗族自治县申报。' },
  { id: 'drum-material', prompt: '布依铜鼓主要用什么材质铸造？', answer: '青铜', options: ['青铜', '木材', '陶土', '竹材'], explanation: '布依铜鼓以青铜铸造。' },
  { id: 'dou-origin', prompt: '斗纹布图案的灵感来自什么器具？', answer: '盛装粮食的“斗”', options: ['盛装粮食的“斗”', '铜鼓', '织布梭', '染缸'], explanation: '斗纹布以盛粮器具“斗”为灵感。' },
  { id: 'dou-meaning', prompt: '斗纹布常表达哪一种祝福？', answer: '五谷丰登、平安幸福', options: ['五谷丰登、平安幸福', '远航贸易', '武艺竞赛', '山林狩猎'], explanation: '斗纹布与丰收、团结、平安和幸福相连。' },
  { id: 'clothing-colors', prompt: '布依族服饰常见的色调组合是？', answer: '蓝、青、白', options: ['蓝、青、白', '紫、金、黑', '红、绿、银', '黄、粉、灰'], explanation: '布依族服饰常使用蓝、青、白等色调。' },
  { id: 'clothing-process', prompt: '哪项属于布依族服饰传统技艺？', answer: '织锦', options: ['织锦', '玻璃吹制', '瓷器烧窑', '木版印刷'], explanation: '传统制作包含纺织、印染、刺绣、蜡染和织锦。' },
  { id: 'clothing-identity', prompt: '布依族服饰还承载什么？', answer: '族群记忆与民俗文化', options: ['族群记忆与民俗文化', '股票交易信息', '航海路线', '工业标准'], explanation: '服饰是生产生活、文化习俗和信仰的重要载体。' },
  { id: 'drum-use', prompt: '铜鼓十二调常出现在哪些场景？', answer: '庆典、祭祖与祭祀', options: ['庆典、祭祖与祭祀', '考试与招聘', '田间灌溉', '城市交通'], explanation: '铜鼓十二调常用于庆典、祭祖和祭祀。' },
  { id: 'tone-count', prompt: '布依语声调学习页展示了几个声调？', answer: '六个', options: ['六个', '四个', '五个', '八个'], explanation: '数字文化馆用六个琴键展示六个声调轮廓。' },
];

function shuffle(items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[next];
    copy[next] = current;
  }
  return copy;
}

Page({
  data: {
    currentTheme: 'light',
    fontSizeClass: 'medium',
    phase: 'intro',
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    selected: '',
    answered: false,
    answers: [],
    score: 0,
    correctCount: 0,
    saveMsg: '',
    saving: false,
    lastAttempt: null,
  },

  async onShow() {
    syncAppearance(this);
    const stored = wx.getStorageSync('quizAttempts');
    if (Array.isArray(stored) && stored[0]) this.setData({ lastAttempt: stored[0] });
    if (getApp().globalData.isLogin) {
      try {
        const response = await quizApi.list(1, 1);
        const remote = response.items && response.items[0];
        const localTime = this.data.lastAttempt ? (new Date(this.data.lastAttempt.createdAt).getTime() || 0) : 0;
        if (remote && (new Date(remote.createdAt).getTime() || 0) >= localTime) this.setData({ lastAttempt: remote });
      } catch (error) {}
    }
  },

  startQuiz() {
    const questions = shuffle(QUIZ_BANK).map((question) => ({ ...question, options: shuffle(question.options) }));
    this.setData({
      phase: 'question',
      questions,
      currentIndex: 0,
      currentQuestion: questions[0],
      selected: '',
      answered: false,
      answers: [],
      score: 0,
      correctCount: 0,
      saveMsg: '',
    });
  },

  selectOption(e) {
    if (this.data.answered) return;
    const selected = e.currentTarget.dataset.option;
    const question = this.data.currentQuestion;
    const correct = selected === question.answer;
    const answers = this.data.answers.concat({ id: question.id, selected, answer: question.answer, correct });
    this.setData({
      selected,
      answered: true,
      answers,
      correctCount: this.data.correctCount + (correct ? 1 : 0),
      score: this.data.score + (correct ? 10 : 0),
    });
  },

  async nextQuestion() {
    if (!this.data.answered) return;
    if (this.data.currentIndex >= this.data.questions.length - 1) {
      this.setData({ phase: 'result' });
      await this.persistResult();
      return;
    }
    const currentIndex = this.data.currentIndex + 1;
    this.setData({
      currentIndex,
      currentQuestion: this.data.questions[currentIndex],
      selected: '',
      answered: false,
    });
  },

  async persistResult() {
    const attempt = {
      score: this.data.score,
      correctCount: this.data.correctCount,
      totalQuestions: this.data.questions.length,
      answers: this.data.answers,
    };
    const stored = wx.getStorageSync('quizAttempts');
    const local = Array.isArray(stored) ? stored : [];
    const savedAttempt = { ...attempt, createdAt: new Date().toISOString() };
    wx.setStorageSync('quizAttempts', [savedAttempt].concat(local).slice(0, 20));
    this.setData({ lastAttempt: savedAttempt });
    if (!getApp().globalData.isLogin) {
      this.setData({ saveMsg: '成绩已保存在本机，登录后可同步到账号。' });
      return;
    }
    this.setData({ saving: true, saveMsg: '正在保存成绩…' });
    try {
      await quizApi.create(attempt);
      this.setData({ saving: false, saveMsg: '成绩已同步到你的学习账号。' });
    } catch (error) {
      this.setData({ saving: false, saveMsg: '成绩已保存在本机，云端同步失败。' });
    }
  },
});
