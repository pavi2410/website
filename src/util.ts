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
  const hues = [12, 27, 45, 142, 230, 200, 270, 310]; // Red, Orange, Amber, Emerald, Blue, Sky, Violet, Fuchsia
  const hue = pickItemByHash(hues, strHash(str));
  
  // OKLCH values: lightness (0-1), chroma (0-0.4), hue (0-360)
  const bgLightness = 0.75; // Lighter background
  const chroma = 0.15;
  const textLightness = bgLightness > 0.6 ? 0.35 : 0.95; // Dark text for light bg, light text for dark bg
  const textChroma = 0.18;
  
  return `background: oklch(${bgLightness} ${chroma} ${hue}); color: oklch(${textLightness} ${textChroma} ${hue});`;
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