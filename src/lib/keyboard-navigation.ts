/** True when arrow keys should move the browser cursor or edit text, not navigate a list. */
export function shouldIgnoreForListArrowNavigation(
  target: EventTarget | null,
): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const el = target;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  const role = el.getAttribute("role");
  if (role === "combobox" || role === "listbox" || role === "textbox")
    return true;
  if (el.closest('[role="combobox"]') != null) return true;
  if (el.closest('[role="listbox"]') != null) return true;
  return false;
}
