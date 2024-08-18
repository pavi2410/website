import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";

dayjs.extend(relativeTime)
dayjs.extend(isToday)

export function pickColorSchemeByStringHash(str: string) {
  const colorSchemes = ['red', 'orange', 'amber', 'emerald', 'blue', 'violet', 'fuchsia'];
  const hash = str.split('').reduce((hash, c) => hash * 31 + c.charCodeAt(0), 0);
  const randomIndex = hash % colorSchemes.length;
  return colorSchemes[randomIndex];
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function pickColorByHash(str: string) {
  const colorSchemes = [
    'outline-red-200 text-red-500',
    'outline-orange-200 text-orange-500',
    'outline-amber-200 text-amber-500',
    'outline-emerald-200 text-emerald-500',
    'outline-blue-200 text-blue-500',
    'outline-violet-200 text-violet-500',
    'outline-fuchsia-200 text-fuchsia-500',
  ];
  const hash = str.split('').reduceRight((hash, c) => hash * 31 + c.charCodeAt(0), 0);
  const randomIndex = hash % colorSchemes.length;
  return colorSchemes[randomIndex];
}

export function formatDateRange(obj: { startDate: string, endDate?: string }) {
  const startDate = dayjs(obj.startDate);
  const endDate = dayjs(obj.endDate);

  const duration = endDate.from(startDate, true);

  if (startDate.isSame(endDate, 'year')) {
    return `${startDate.format('MMM')} - ${endDate.format('MMM')} ${startDate.year()} (${duration})`;
  }

  const startFmt = startDate.format('MMM YYYY');
  const endFmt = endDate.isToday() ? 'Present' : endDate.format('MMM YYYY');

  return `${startFmt} - ${endFmt} (${duration})`;
}