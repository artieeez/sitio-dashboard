/** Horizontal scroll so the trailing (end) content is visible (LTR). */
export function setScrollLeftToEnd(el: HTMLElement) {
  el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
}
