import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";

dayjs.extend(relativeTime)
dayjs.extend(isToday)

function strHash(str: string) {
  return str.split('').reduce((hash, c) => Math.imul(15, hash) + c.charCodeAt(0), 0);
}

function pickItemByHash<T>(arr: T[], hash: number) {
  const index = Math.abs(hash) % arr.length;
  return arr[index];
}

export function pickColorSchemeByStringHash(str: string) {
  const colorSchemes = ['red', 'orange', 'amber', 'emerald', 'blue', 'violet', 'fuchsia'];
  return pickItemByHash(colorSchemes, strHash(str));
}

export function pickColorByHash(str: string) {
  const colorSchemes = [
    'bg-red-700/50 text-red-500',
    'bg-orange-700/50 text-orange-500',
    'bg-amber-700/50 text-amber-500',
    'bg-emerald-700/50 text-emerald-500',
    'bg-blue-700/50 text-blue-500',
    'bg-sky-700/50 text-sky-500',
    'bg-violet-700/50 text-violet-500',
    'bg-fuchsia-700/50 text-fuchsia-500',
  ];
  return pickItemByHash(colorSchemes, strHash(str));
}

export function pickColorGradientByHash(str: string) {
  const colorSchemes = [
    'bg-linear-to-t from-red-500 border-red-500 text-red-500',
    'bg-linear-to-t from-orange-500 border-orange-500 text-orange-500',
    'bg-linear-to-t from-amber-500 border-amber-500 text-amber-500',
    'bg-linear-to-t from-emerald-500 border-emerald-500 text-emerald-500',
    'bg-linear-to-t from-blue-500 border-blue-500 text-blue-500',
    'bg-linear-to-t from-violet-500 border-violet-500 text-violet-500',
    'bg-linear-to-t from-fuchsia-500 border-fuchsia-500 text-fuchsia-500',
  ];
  return pickItemByHash(colorSchemes, strHash(str));
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
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