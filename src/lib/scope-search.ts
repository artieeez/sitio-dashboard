import type { School } from "@/lib/schemas/school";
import type { RecentSchoolEntry } from "@/lib/schemas/scope";

export function filterSchoolsByTitle(
  schools: School[],
  query: string,
): School[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return schools;
  return schools.filter((school) =>
    (school.title ?? "").toLocaleLowerCase().includes(normalized),
  );
}

export function orderRecentSchools(
  schools: School[],
  recents: RecentSchoolEntry[],
): School[] {
  const byId = new Map(schools.map((school) => [school.id, school]));
  const sorted = recents
    .map((entry) => byId.get(entry.schoolId))
    .filter((school): school is School => !!school);
  return sorted.slice(0, 10);
}
