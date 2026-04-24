/** Trim plain text to a max length without cutting mid-word when possible. */
export function trimPlainExcerpt(text: string, maxLen: number): string {
  const normalized = text.trim();
  if (normalized.length <= maxLen) return normalized;
  const slice = normalized.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.55) {
    return `${slice.slice(0, lastSpace).trimEnd()}…`;
  }
  return `${slice.trimEnd()}…`;
}
