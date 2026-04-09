import { isUuid } from "@/lib/uuid";

/**
 * School id from URL when the first segment after `/schools/` is a UUID.
 * `/schools/new` and other non-UUID segments are not treated as a selected school.
 */
export function schoolIdFromPathname(pathname: string): string {
  const seg = pathname.match(/^\/schools\/([^/]+)/)?.[1] ?? "";
  return isUuid(seg) ? seg : "";
}
