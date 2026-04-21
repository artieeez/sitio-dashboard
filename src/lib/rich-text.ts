/** Strip HTML and return trimmed visible text, or empty string if none. */
export function richTextVisibleText(html: string): string {
  if (typeof document === "undefined") {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .trim();
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\u00a0/g, " ").trim();
}

/** Collapse visually-empty rich text to null for API payloads. */
export function normalizeRichTextForSave(html: string): string | null {
  const trimmed = html.trim();
  if (!trimmed) {
    return null;
  }
  if (!richTextVisibleText(trimmed)) {
    return null;
  }
  return trimmed;
}
