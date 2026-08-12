/** Tag display strings are lowercase kebab already, but slugify defensively
 *  so a tag with spaces or capitals can't produce a broken URL. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** ~230 wpm is a reasonable pace for technical prose. Always at least 1. */
export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}
