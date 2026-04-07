import { beforeEach, describe, expect, it } from "vitest";
import { getRecentSchools, touchRecentSchool } from "@/lib/scope-persistence";

describe("scope-persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("dedupes and keeps latest first", () => {
    touchRecentSchool("550e8400-e29b-41d4-a716-446655440000");
    touchRecentSchool("550e8400-e29b-41d4-a716-446655440001");
    touchRecentSchool("550e8400-e29b-41d4-a716-446655440000");
    const recents = getRecentSchools();
    expect(recents[0]?.schoolId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(recents).toHaveLength(2);
  });

  it("caps at 10 entries", () => {
    const ids = [
      "550e8400-e29b-41d4-a716-446655440010",
      "550e8400-e29b-41d4-a716-446655440011",
      "550e8400-e29b-41d4-a716-446655440012",
      "550e8400-e29b-41d4-a716-446655440013",
      "550e8400-e29b-41d4-a716-446655440014",
      "550e8400-e29b-41d4-a716-446655440015",
      "550e8400-e29b-41d4-a716-446655440016",
      "550e8400-e29b-41d4-a716-446655440017",
      "550e8400-e29b-41d4-a716-446655440018",
      "550e8400-e29b-41d4-a716-446655440019",
      "550e8400-e29b-41d4-a716-446655440020",
    ];
    for (const id of ids) touchRecentSchool(id);
    expect(getRecentSchools()).toHaveLength(10);
  });
});
