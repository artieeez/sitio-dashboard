import type { School } from "@/lib/schemas/school";

export function findLastCreatedSchool(schools: School[]): School | null {
  if (schools.length === 0) return null;
  return [...schools].sort((a, b) => {
    const byCreatedAt = b.createdAt.localeCompare(a.createdAt);
    if (byCreatedAt !== 0) return byCreatedAt;
    return b.id.localeCompare(a.id);
  })[0];
}

export function resolveInitialSchoolId(params: {
  schools: School[];
  lastAccessedSchoolId?: string | null;
}): string | null {
  const { schools, lastAccessedSchoolId } = params;
  if (
    lastAccessedSchoolId &&
    schools.some((s) => s.id === lastAccessedSchoolId)
  ) {
    return lastAccessedSchoolId;
  }
  return findLastCreatedSchool(schools)?.id ?? null;
}
