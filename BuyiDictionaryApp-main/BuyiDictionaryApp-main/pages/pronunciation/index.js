const { quizApi, pronunciationApi } = require('../../utils/api');
const { syncAppearance } = require('../../utils/view');
const { notifyUserProgressUpdated } = require('../../utils/userProgress');

// 相似度换算积分：0-1 相似度映射为 0-10 整数分
function toPoints(similarity) {
  const value = Number(similarity);
  const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  return Math.round(clamped * 10);
}

Page({
  data: {
    currentTheme: 'light',
    fontSizeClass: 'medium',
    phase: 'intro',
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    answers: [],
    score: 0,
    correctCount: 0,
    saveMsg: '',
    saving: false,
    lastAttempt: null,
    loadingQuestions: false,
    // 语音识别插件是否可用
    pluginReady: false,
    recording: false,
    evaluating: false,
    transientStr: '',
    recognizeError: '',
    lastResult: null,
  },

  onLoad() {
    this.audioCtx = null;
    this.recordManager = null;
    this.initRecordManager();
  },

  onShow() {
    syncAppearance(this);
    const stored = wx.getStorageSync('pronunciationAttempts');
    if (Array.isArray(stored) && stored[0]) this.setData({ lastAttempt: stored[0] });
  },

  onUnload() {
    // 停止进行中的语音识别
    if (this.recordManager) {
      try { this.recordManager.stop(); } catch (error) {}
    }
    // 停止并释放音频资源
    if (this.audioCtx) {
      try {
        this.audioCtx.stop();
        this.audioCtx.destroy();
      } catch (error) {}
      this.audioCtx = null;
    }
  },

  // 初始化微信同声传译插件的语音识别管理器，失败时兜底为插件不可用
  initRecordManager() {
    try {
      const plugin = requirePlugin('WechatSI');
      const manager = plugin.getRecordRecognitionManager();
      manager.onStart = () => {
        this.setData({ transientStr: '', recognizeError: '' });
      };
      manager.onRecognize = (res) => {
        // 实时中间识别结果
        this.setData({ transientStr: (res && res.result) || '' });
      };
      manager.onStop = (res) => {
        const recognizedText = String((res && res.result) || '').trim();
        this.setData({ recording: false });
        if (!recognizedText) {
          this.setData({ recognizeError: '没有听清，请再试一次。' });
          return;
        }
        this.evaluateScore(recognizedText);
      };
      manager.onError = () => {
        this.setData({
          recording: false,
          recognizeError: '识别失败，请稍后重试。',
        });
      };
      this.recordManager = manager;
      this.setData({ pluginReady: true });
    } catch (error) {
      // 插件不可用：不影响进入页面浏览，仅禁用跟读按钮
      this.recordManager = null;
      this.setData({ pluginReady: false });
    }
  },

  onAbandon() {
    wx.showModal({
      title: '确认放弃',
      content: '本场跟读进度将不被保存，是否放弃？',
      success: (res) => {
        if (!res.confirm) return;
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/home/index' });
        }
      },
    });
  },

  // 开始闯关：拉取跟读题目
  async startChallenge() {
    if (this.data.loadingQuestions) return;
    this.setData({ loadingQuestions: true });
    try {
      const response = await pronunciationApi.questions(5);
      const items = response && Array.isArray(response.items) ? response.items : [];
      if (!items.length) {
        this.setData({ loadingQuestions: false });
        wx.showToast({ title: '暂无跟读题目，请稍后再试', icon: 'none' });
        return;
      }
      this.setData({
        loadingQuestions: false,
        phase: 'question',
        questions: items,
        currentIndex: 0,
        currentQuestion: items[0],
        answers: [],
        score: 0,
        correctCount: 0,
        saveMsg: '',
        transientStr: '',
        recognizeError: '',
        lastResult: null,
      });
    } catch (error) {
      this.setData({ loadingQuestions: false });
    }
  },

  // 播放标准发音
  playAudio() {
    const question = this.data.currentQuestion;
    if (!question || !question.audioUrl) return;
    // 录音过程中先结束录音，避免互相干扰
    if (this.data.recording) this.onRecordEnd();
    if (!this.audioCtx) {
      this.audioCtx = wx.createInnerAudioContext();
    }
    this.audioCtx.stop();
    this.audioCtx.src = this.resolveAudioUrl(question.audioUrl);
    this.audioCtx.play();
  },

  // audioUrl 为相对路径时拼接后端地址
  resolveAudioUrl(url) {
    const text = String(url || '');
    if (/^https?:\/\//i.test(text)) return text;
    try {
      const app = getApp();
      const base = String((app && typeof app.getApiBase === 'function' ? app.getApiBase() : '') || '').replace(/\/+$/, '');
      return base + (text.startsWith('/') ? text : `/${text}`);
    } catch (error) {
      return text;
    }
  },

  // 按住跟读：touchstart 触发（先检查录音授权）
  onRecordStart() {
    if (!this.data.pluginReady || !this.recordManager) {
      wx.showToast({ title: '语音识别插件不可用', icon: 'none' });
      return;
    }
    if (this.data.recording || this.data.evaluating) return;
    wx.getSetting({
      success: (res) => {
        const recordAuth = res.authSetting['scope.record'];
        if (recordAuth === false) {
          // 曾经拒绝授权：引导前往设置开启
          this.guideToSetting();
          return;
        }
        if (recordAuth === true) {
          this.doStartRecord();
          return;
        }
        // 首次使用：申请录音授权
        wx.authorize({
          scope: 'scope.record',
          success: () => this.doStartRecord(),
          fail: () => this.guideToSetting(),
        });
      },
      fail: () => {
        // 获取授权状态失败时不阻断，直接尝试录音
        this.doStartRecord();
      },
    });
  },

  // 松开结束跟读：touchend / touchcancel 触发
  onRecordEnd() {
    if (!this.data.recording || !this.recordManager) return;
    try {
      this.recordManager.stop();
    } catch (error) {
      this.setData({ recording: false, recognizeError: '识别失败，请稍后重试。' });
    }
  },

  // 引导用户前往设置开启录音权限
  guideToSetting() {
    wx.showModal({
      title: '需要录音权限',
      content: '跟读评测需要使用麦克风录音，请在设置中开启录音权限。',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({});
        }
      },
    });
  },

  // 真正开始录音识别（最长 6 秒）
  doStartRecord() {
    if (this.data.recording) return;
    this.setData({
      recording: true,
      transientStr: '',
      recognizeError: '',
    });
    try {
      this.recordManager.start({ duration: 6000, lang: 'zh_CN' });
    } catch (error) {
      this.setData({ recording: false, recognizeError: '录音启动失败，请重试。' });
    }
  },

  // 调用后端 AI 评分接口并展示结果
  async evaluateScore(recognizedText) {
    const question = this.data.currentQuestion;
    if (!question) return;
    this.setData({ evaluating: true, recognizeError: '' });
    try {
      const result = await pronunciationApi.score({
        targetText: question.buyiText,
        recognizedText,
      });
      const similarity = Math.min(1, Math.max(0, Number(result.similarity) || 0));
      const points = toPoints(similarity);
      const correct = points >= 6;
      const targetSyllables = Array.isArray(result.targetSyllables) ? result.targetSyllables : [];
      const recognizedSyllables = Array.isArray(result.recognizedSyllables) ? result.recognizedSyllables : [];
      const lastResult = {
        score: Math.min(100, Math.max(0, Math.round(Number(result.score) || 0))),
        similarity,
        feedback: result.feedback || '',
        recognizedText,
        // 音节逐个对比着色：相同为绿，不同为红
        targetMarks: targetSyllables.map((text, idx) => ({ idx, text: String(text), match: String(text) === String(recognizedSyllables[idx]) })),
        recognizedMarks: recognizedSyllables.map((text, idx) => ({ idx, text: String(text), match: String(text) === String(targetSyllables[idx]) })),
        points,
        correct,
      };
      // 每题以最后一次评分计分：覆盖当前题的作答记录
      const answers = this.data.answers.slice(0, this.data.currentIndex).concat([{
        id: question.id,
        type: 'pronunciation',
        buyiText: question.buyiText,
        zhText: question.zhText,
        recognizedText,
        similarity,
        points,
        correct,
      }]);
      const score = answers.reduce((sum, item) => sum + item.points, 0);
      const correctCount = answers.filter((item) => item.correct).length;
      this.setData({
        evaluating: false,
        lastResult,
        answers,
        score,
        correctCount,
      });
    } catch (error) {
      this.setData({
        evaluating: false,
        recognizeError: '评分失败，请重试。',
      });
    }
  },

  // 再试一次：清除本次评分，重新跟读本题
  retryQuestion() {
    if (this.data.evaluating || this.data.recording) return;
    this.setData({
      lastResult: null,
      transientStr: '',
      recognizeError: '',
    });
  },

  // 下一题（未评分不可进入下一题）
  nextQuestion() {
    if (!this.data.lastResult || this.data.evaluating) return;
    if (this.data.currentIndex >= this.data.questions.length - 1) {
      this.setData({ phase: 'result' });
      this.persistResult();
      return;
    }
    const currentIndex = this.data.currentIndex + 1;
    this.setData({
      currentIndex,
      currentQuestion: this.data.questions[currentIndex],
      transientStr: '',
      recognizeError: '',
      lastResult: null,
    });
  },

  // 保存成绩：本机优先，登录态再同步云端（对齐答题页逻辑）
  async persistResult() {
    const attempt = {
      score: this.data.score,
      correctCount: this.data.correctCount,
      totalQuestions: this.data.questions.length,
      answers: this.data.answers,
    };
    const stored = wx.getStorageSync('pronunciationAttempts');
    const local = Array.isArray(stored) ? stored : [];
    const savedAttempt = { ...attempt, createdAt: new Date().toISOString() };
    wx.setStorageSync('pronunciationAttempts', [savedAttempt].concat(local).slice(0, 20));
    this.setData({ lastAttempt: savedAttempt });
    if (!getApp().globalData.isLogin) {
      this.setData({ saveMsg: '成绩已保存在本机，登录后可同步到账号。' });
      return;
    }
    // 登录态：本地已保存，立即通知每日任务进度（不依赖云端同步）
    try {
      notifyUserProgressUpdated('quiz', 'quiz');
    } catch (e) {
      // 联动失败不影响主流程
    }
    this.setData({ saving: true, saveMsg: '正在保存成绩…' });
    try {
      await quizApi.create({
        mode: 'pronunciation',
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        answers: attempt.answers.map((item) => ({
          id: item.id,
          type: 'pronunciation',
          buyiText: item.buyiText,
          zhText: item.zhText,
          recognizedText: item.recognizedText,
          similarity: item.similarity,
          points: item.points,
          correct: item.correct,
        })),
      });
      this.setData({ saving: false, saveMsg: '成绩已同步到你的学习账号。' });
    } catch (error) {
      this.setData({ saving: false, saveMsg: '成绩已保存在本机，云端同步失败。' });
    }
  },
});
