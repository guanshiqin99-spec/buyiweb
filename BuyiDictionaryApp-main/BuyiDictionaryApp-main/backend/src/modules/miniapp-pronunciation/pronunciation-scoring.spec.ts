import { scorePronunciation } from './pronunciation-scoring';

describe('scorePronunciation', () => {
  it('精确匹配：目标 na 识别 那得满分', () => {
    const result = scorePronunciation('na', '那');
    expect(result.score).toBe(100);
    expect(result.similarity).toBe(1);
    expect(result.feedback).toBe('发音标准，非常地道！');
    expect(result.targetSyllables).toEqual(['na']);
    expect(result.recognizedSyllables).toEqual(['na']);
  });

  it('空识别文本：不抛错并返回 0 分', () => {
    const result = scorePronunciation('na', '');
    expect(result.score).toBe(0);
    expect(result.similarity).toBe(0);
    expect(result.feedback).toBe('没有听清，请再试一次');
    expect(result.recognizedSyllables).toEqual([]);
  });

  it('纯标点识别文本同样视为没有听清', () => {
    const result = scorePronunciation('na', '。。。');
    expect(result.score).toBe(0);
    expect(result.similarity).toBe(0);
    expect(result.feedback).toBe('没有听清，请再试一次');
  });

  it('部分匹配：目标 mang bai rux 识别 芒摆如得到介于 0 与 1 之间的相似度', () => {
    const result = scorePronunciation('mang bai rux', '芒摆如');
    expect(result.similarity).toBeGreaterThan(0);
    expect(result.similarity).toBeLessThan(1);
    expect(result.score).toBe(Math.round(result.similarity * 100));
    expect(result.targetSyllables).toEqual(['mang', 'bai', 'rux']);
    expect(result.recognizedSyllables).toEqual(['mang', 'bai', 'ru']);
  });

  it('多音节编辑距离：目标 gan cau 识别 吃饭相似度在 0-1 之间', () => {
    const result = scorePronunciation('gan cau', '吃饭');
    expect(result.similarity).toBeGreaterThanOrEqual(0);
    expect(result.similarity).toBeLessThanOrEqual(1);
    expect(result.score).toBe(Math.round(result.similarity * 100));
    expect(result.targetSyllables).toEqual(['gan', 'cau']);
    expect(result.recognizedSyllables).toEqual(['chi', 'fan']);
  });

  it('反馈文案按分数分档', () => {
    expect(scorePronunciation('na', '那').feedback).toBe('发音标准，非常地道！');
    // mang bai rux vs mang bai ru：相似度 2/3，约 67 分
    expect(scorePronunciation('mang bai rux', '芒摆如').feedback).toBe('接近标准发音，再练一练！');
    // gan cau vs chi fan：音节完全不同，0 分
    expect(scorePronunciation('gan cau', '吃饭').feedback).toBe('发音差距较大，多听多读几遍再试试');
  });

  it('目标文本去标点并转小写后再切分音节', () => {
    const result = scorePronunciation(' Na, Gau! ', '那高');
    expect(result.targetSyllables).toEqual(['na', 'gau']);
    expect(result.recognizedSyllables).toEqual(['na', 'gao']);
  });
});
