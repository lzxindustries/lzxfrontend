/** Shared blog post display helpers (dates, author labels). */

export function formatBlogPostDate(dateStr: string): string {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Title-case short lowercase handles (e.g. community bylines) without mangling mixed-case names. */
export function formatAuthorDisplay(name: string): string {
  const t = name.trim();
  if (!t) return t;
  if (t === t.toLowerCase()) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  return t;
}
