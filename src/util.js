export function pickColorSchemeByStringHash(str) {
  const colorSchemes = ['red', 'orange', 'amber', 'emerald', 'blue', 'violet', 'fuchsia'];
  const hash = str.split('').reduce((hash, c) => hash * 31 + c.charCodeAt(0), 0);
  const randomIndex = hash % colorSchemes.length;
  return colorSchemes[randomIndex];
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
}