import { describe, expect, it } from "vitest";
import { setScrollLeftToEnd } from "@/lib/scroll-overflow-end";

describe("setScrollLeftToEnd (US3)", () => {
  it("sets scrollLeft to scrollWidth - clientWidth when content overflows", () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "scrollWidth", {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(el, "clientWidth", {
      value: 100,
      configurable: true,
    });
    setScrollLeftToEnd(el);
    expect(el.scrollLeft).toBe(400);
  });
});
