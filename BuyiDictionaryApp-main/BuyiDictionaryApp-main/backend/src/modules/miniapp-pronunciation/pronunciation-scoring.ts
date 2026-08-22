import { pinyin } from 'pinyin-pro';

// 发音评测结果
export interface PronunciationScoreResult {
  score: number;
  similarity: number;
  feedback: string;
  targetSyllables: string[];
  recognizedSyllables: string[];
}

// 匹配字母、数字与空白以外的字符（即标点等待去除内容）
const NON_WORD_REGEX = /[^\p{L}\p{N}\s]/gu;

// 将目标布依文文本规范化为小写音节数组：小写化、去标点、按空格切分
export function normalizeTargetSyllables(targetText: string): string[] {
  return targetText
    .toLowerCase()
    .replace(NON_WORD_REGEX, '')
    .split(/\s+/)
    .filter((syllable) => syllable.length > 0);
}

// 将识别出的汉字文本转换为无声调拼音音节数组，过滤掉标点等非字母元素
export function toPinyinSyllables(recognizedText: string): string[] {
  return pinyin(recognizedText, { toneType: 'none', type: 'array' })
    .map((syllable) => syllable.trim().toLowerCase())
    .filter((syllable) => /^[a-z]+$/.test(syllable));
}

// 计算两个音节序列的 Levenshtein 编辑距离（滚动数组实现）
export function levenshteinDistance(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, index) => index);
  for (let i = 1; i <= m; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

// 按分数分档生成反馈文案
function buildFeedback(score: number): string {
  if (score >= 90) return '发音标准，非常地道！';
  if (score >= 75) return '发音不错，继续保持！';
  if (score >= 60) return '接近标准发音，再练一练！';
  return '发音差距较大，多听多读几遍再试试';
}

// 发音相似度评分：目标文本为布依文拉丁转写，识别文本为汉字
export function scorePronunciation(targetText: string, recognizedText: string): PronunciationScoreResult {
  const targetSyllables = normalizeTargetSyllables(targetText);

  // 识别文本为空或去标点后为空时，视为没有听清，不抛错
  const cleanedRecognition = recognizedText.replace(NON_WORD_REGEX, '').trim();
  if (recognizedText.trim().length === 0 || cleanedRecognition.length === 0) {
    return {
      score: 0,
      similarity: 0,
      feedback: '没有听清，请再试一次',
      targetSyllables,
      recognizedSyllables: [],
    };
  }

  const recognizedSyllables = toPinyinSyllables(recognizedText);
  const distance = levenshteinDistance(targetSyllables, recognizedSyllables);
  const maxLength = Math.max(targetSyllables.length, recognizedSyllables.length);
  // 两序列均空时相似度记 0
  const similarity = maxLength === 0 ? 0 : 1 - distance / maxLength;
  const score = Math.round(similarity * 100);

  return {
    score,
    similarity,
    feedback: buildFeedback(score),
    targetSyllables,
    recognizedSyllables,
  };
}
