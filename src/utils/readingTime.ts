import getReadingTime from 'reading-time';

export function readingTime(content: string) {
  const stats = getReadingTime(content);
  return Math.ceil(stats.minutes) + ' 分钟阅读';
}
