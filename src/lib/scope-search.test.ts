import { describe, expect, it } from "vitest";
import { filterSchoolsByTitle, orderRecentSchools } from "@/lib/scope-search";

const schools = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Escola Aurora",
    faviconUrl: null,
    url: null,
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Colégio Horizonte",
    faviconUrl: null,
    url: null,
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
] as const;

describe("scope search helpers", () => {
  it("filters by case-insensitive title substring", () => {
    expect(filterSchoolsByTitle([...schools], "aur")).toHaveLength(1);
    expect(filterSchoolsByTitle([...schools], "HORIZONTE")).toHaveLength(1);
  });

  it("orders recents and ignores unknown schools", () => {
    const ordered = orderRecentSchools(
      [...schools],
      [
        { schoolId: schools[1].id, lastOpenedAt: "2026-01-01T00:00:00.000Z" },
        {
          schoolId: "550e8400-e29b-41d4-a716-446655440099",
          lastOpenedAt: "2026-01-01T00:00:00.000Z",
        },
        { schoolId: schools[0].id, lastOpenedAt: "2026-01-01T00:00:00.000Z" },
      ],
    );
    expect(ordered.map((school) => school.id)).toEqual([
      schools[1].id,
      schools[0].id,
    ]);
  });
});
