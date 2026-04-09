import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ScopeBlockingError } from "@/components/layout/scope-blocking-error";
import { useSchoolsForScope } from "@/hooks/use-schools-for-scope";
import { resolveInitialSchoolId } from "@/lib/resolve-initial-school";
import {
  getLastAccessedSchoolId,
  setLastAccessedSchoolId,
  touchRecentSchool,
} from "@/lib/scope-persistence";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const navigate = useNavigate();
  const schoolsQuery = useSchoolsForScope();

  useEffect(() => {
    if (!schoolsQuery.data) return;
    const nextSchoolId = resolveInitialSchoolId({
      schools: schoolsQuery.data,
      lastAccessedSchoolId: getLastAccessedSchoolId(),
    });
    if (nextSchoolId) {
      setLastAccessedSchoolId(nextSchoolId);
      touchRecentSchool(nextSchoolId);
      navigate({
        to: "/schools/$schoolId/home",
        params: { schoolId: nextSchoolId },
      });
      return;
    }
    navigate({ to: "/schools/new" });
  }, [schoolsQuery.data, navigate]);

  if (schoolsQuery.isError) {
    return <ScopeBlockingError onRetry={() => schoolsQuery.refetch()} />;
  }

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">{ptBR.shell.loading}</p>
    </div>
  );
}
