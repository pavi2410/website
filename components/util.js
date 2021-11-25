export function pickColorSchemeByStringHash(str) {
  const colorSchemes = ['blue', 'green', 'orange', 'red', 'purple', 'yellow'];
  const hash = str.split('').reduce((hash, c) => hash + c.charCodeAt(0), 0);
  const randomIndex = hash % colorSchemes.length;
  return colorSchemes[randomIndex];
}