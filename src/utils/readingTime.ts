// @ts-ignore
import getReadingTime from 'reading-time/lib/reading-time.js';

export function readingTime(content: string) {
  const stats = getReadingTime(content);
  return Math.ceil(stats.minutes) + ' 分钟阅读';
}
