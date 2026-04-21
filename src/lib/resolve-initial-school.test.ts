import { describe, expect, it } from "vitest";
import {
  findLastCreatedSchool,
  resolveInitialSchoolId,
} from "@/lib/resolve-initial-school";

const schools = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    wixCollectionId: null,
    title: "A",
    description: null,
    imageUrl: null,
    faviconUrl: null,
    url: null,
    active: true,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    wixCollectionId: null,
    title: "B",
    description: null,
    imageUrl: null,
    faviconUrl: null,
    url: null,
    active: true,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
] as const;

describe("resolveInitialSchoolId", () => {
  it("prefers valid last accessed", () => {
    expect(
      resolveInitialSchoolId({
        schools: [...schools],
        lastAccessedSchoolId: schools[0].id,
      }),
    ).toBe(schools[0].id);
  });

  it("falls back to last created with deterministic tie-break", () => {
    expect(findLastCreatedSchool([...schools])?.id).toBe(schools[1].id);
  });

  it("ignores stale last accessed id and falls back", () => {
    expect(
      resolveInitialSchoolId({
        schools: [...schools],
        lastAccessedSchoolId: "550e8400-e29b-41d4-a716-446655449999",
      }),
    ).toBe(schools[1].id);
  });
});
