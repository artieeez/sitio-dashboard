import { describe, expect, it } from "vitest";
import { isUuid } from "./uuid";

describe("isUuid", () => {
  it("accepts lowercase v4 UUIDs", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects arbitrary strings", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
  });
});
