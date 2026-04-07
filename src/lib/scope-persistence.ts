import {
  type RecentSchoolEntry,
  recentSchoolsPayloadSchema,
} from "@/lib/schemas/scope";

const LAST_SCHOOL_ID_KEY = "sitio.dashboard.scope.v1.lastSchoolId";
const RECENT_SCHOOLS_KEY = "sitio.dashboard.scope.v1.recentSchools";
const MAX_RECENTS = 10;

function getStorage(): Storage | null {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getLastAccessedSchoolId(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  const value = storage.getItem(LAST_SCHOOL_ID_KEY);
  return value && value.length > 0 ? value : null;
}

export function setLastAccessedSchoolId(schoolId: string) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(LAST_SCHOOL_ID_KEY, schoolId);
}

export function getRecentSchools(): RecentSchoolEntry[] {
  const storage = getStorage();
  if (!storage) return [];
  const raw = storage.getItem(RECENT_SCHOOLS_KEY);
  if (!raw) return [];
  try {
    return recentSchoolsPayloadSchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function touchRecentSchool(schoolId: string) {
  const storage = getStorage();
  if (!storage) return;
  const now = new Date().toISOString();
  const deduped = getRecentSchools().filter(
    (entry) => entry.schoolId !== schoolId,
  );
  const next = [{ schoolId, lastOpenedAt: now }, ...deduped].slice(
    0,
    MAX_RECENTS,
  );
  storage.setItem(RECENT_SCHOOLS_KEY, JSON.stringify(next));
}
