const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  Kotlin: "#A97BFF",
  Rust: "#dea584",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  Python: "#3572A5",
  MDX: "#1B1F24",
};

export function languageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#8b949e";
}
