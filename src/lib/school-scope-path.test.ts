import { describe, expect, it } from "vitest";
import { schoolIdFromPathname } from "@/lib/school-scope-path";

describe("schoolIdFromPathname", () => {
  it("returns empty for /schools/new (create flow, not a school id)", () => {
    expect(schoolIdFromPathname("/schools/new")).toBe("");
  });

  it("returns uuid for /schools/:id", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(schoolIdFromPathname(`/schools/${id}`)).toBe(id);
    expect(schoolIdFromPathname(`/schools/${id}/trips`)).toBe(id);
  });

  it("returns empty for non-uuid slug under /schools/", () => {
    expect(schoolIdFromPathname("/schools/foo")).toBe("");
  });

  it("returns empty when not under /schools/", () => {
    expect(schoolIdFromPathname("/")).toBe("");
    expect(schoolIdFromPathname("/schools")).toBe("");
  });
});
