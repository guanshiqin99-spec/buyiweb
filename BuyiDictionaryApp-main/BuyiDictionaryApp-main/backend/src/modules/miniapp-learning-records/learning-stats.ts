import { ContentType } from '../../common/enums/content-type.enum';

const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export interface LearningRecordStatsSource {
  contentType: ContentType;
  createdAt: Date | string;
}

function shanghaiDayOrdinal(value: Date | string) {
  const parts = SHANGHAI_DATE_FORMATTER.formatToParts(new Date(value));
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function calculateLearningStats(
  records: LearningRecordStatsSource[],
  now: Date = new Date(),
) {
  const typeCounts: Record<ContentType, number> = {
    [ContentType.DICTIONARY]: 0,
    [ContentType.PHRASE]: 0,
    [ContentType.PROVERB]: 0,
    [ContentType.SONG]: 0,
  };

  const todayOrdinal = shanghaiDayOrdinal(now);
  const learnedDays = new Set<number>();
  let todayCount = 0;

  for (const record of records) {
    if (record.contentType in typeCounts) typeCounts[record.contentType] += 1;
    const dayOrdinal = shanghaiDayOrdinal(record.createdAt);
    learnedDays.add(dayOrdinal);
    if (dayOrdinal === todayOrdinal) todayCount += 1;
  }

  // 今天尚未学习时，仍保留截至昨天的连续天数；一旦中断则归零。
  let cursor = learnedDays.has(todayOrdinal) ? todayOrdinal : todayOrdinal - 1;
  let streakDays = 0;
  while (learnedDays.has(cursor)) {
    streakDays += 1;
    cursor -= 1;
  }

  const totalCount = records.length;
  return {
    todayCount,
    totalCount,
    streakDays,
    typeCounts,
    // 保留旧字段，兼容小程序和现有首页文案。
    today: todayCount,
    total: totalCount,
    streak: streakDays,
  };
}
