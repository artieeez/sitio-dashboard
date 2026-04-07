import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchSchoolsList } from "@/lib/schools-api";

export function useSchoolsForScope() {
  return useQuery({
    queryKey: queryKeys.scopeSchools(),
    queryFn: fetchSchoolsList,
  });
}
