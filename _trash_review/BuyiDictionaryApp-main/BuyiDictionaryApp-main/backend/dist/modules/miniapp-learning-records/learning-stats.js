"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLearningStats = calculateLearningStats;
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
function shanghaiDayOrdinal(value) {
    const parts = SHANGHAI_DATE_FORMATTER.formatToParts(new Date(value));
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}
function calculateLearningStats(records, now = new Date()) {
    const typeCounts = {
        [content_type_enum_1.ContentType.DICTIONARY]: 0,
        [content_type_enum_1.ContentType.PHRASE]: 0,
        [content_type_enum_1.ContentType.PROVERB]: 0,
        [content_type_enum_1.ContentType.SONG]: 0,
    };
    const todayOrdinal = shanghaiDayOrdinal(now);
    const learnedDays = new Set();
    let todayCount = 0;
    for (const record of records) {
        if (record.contentType in typeCounts)
            typeCounts[record.contentType] += 1;
        const dayOrdinal = shanghaiDayOrdinal(record.createdAt);
        learnedDays.add(dayOrdinal);
        if (dayOrdinal === todayOrdinal)
            todayCount += 1;
    }
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
        today: todayCount,
        total: totalCount,
        streak: streakDays,
    };
}
//# sourceMappingURL=learning-stats.js.map