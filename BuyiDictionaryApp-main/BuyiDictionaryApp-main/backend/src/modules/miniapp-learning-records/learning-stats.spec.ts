import { ContentType } from '../../common/enums/content-type.enum';
import { calculateLearningStats } from './learning-stats';

describe('calculateLearningStats', () => {
  it('uses Asia/Shanghai calendar days and exposes both API field conventions', () => {
    const stats = calculateLearningStats([
      // 北京时间 7 月 15 日 00:30
      { contentType: ContentType.DICTIONARY, createdAt: '2026-07-14T16:30:00.000Z' },
      // 北京时间 7 月 14 日 23:00
      { contentType: ContentType.PHRASE, createdAt: '2026-07-14T15:00:00.000Z' },
    ], new Date('2026-07-15T01:00:00.000Z'));

    expect(stats.todayCount).toBe(1);
    expect(stats.totalCount).toBe(2);
    expect(stats.streakDays).toBe(2);
    expect(stats.today).toBe(stats.todayCount);
    expect(stats.total).toBe(stats.totalCount);
    expect(stats.streak).toBe(stats.streakDays);
    expect(stats.typeCounts.dictionary).toBe(1);
    expect(stats.typeCounts.phrase).toBe(1);
  });

  it('keeps a streak through yesterday and resets it after a missed day', () => {
    const yesterday = calculateLearningStats([
      { contentType: ContentType.SONG, createdAt: '2026-07-14T05:00:00.000Z' },
    ], new Date('2026-07-15T05:00:00.000Z'));
    expect(yesterday.streakDays).toBe(1);

    const missedDay = calculateLearningStats([
      { contentType: ContentType.SONG, createdAt: '2026-07-13T05:00:00.000Z' },
    ], new Date('2026-07-15T05:00:00.000Z'));
    expect(missedDay.streakDays).toBe(0);
  });
});
