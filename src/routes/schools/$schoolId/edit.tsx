import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { useEffect } from "react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { schoolSchema } from "@/lib/schemas/school";
import {
  setLastAccessedSchoolId,
  touchRecentSchool,
} from "@/lib/scope-persistence";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/schools/$schoolId/edit")({
  component: SchoolEditPage,
});

function SchoolEditPage() {
  const { schoolId } = useParams({ strict: false }) as { schoolId: string };
  const { requestCloseDetail } = useListDetailLayout();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const includeInactive = useUiPreferencesStore(
    (s) => s.includeInactiveSchools,
  );
  const schoolIdValid = isUuid(schoolId);

  const schoolQuery = useQuery({
    queryKey: queryKeys.school(schoolId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/schools/${schoolId}`);
      return schoolSchema.parse(raw);
    },
    enabled: schoolIdValid,
  });

  useEffect(() => {
    if (!schoolQuery.data) return;
    setLastAccessedSchoolId(schoolQuery.data.id);
    touchRecentSchool(schoolQuery.data.id);
  }, [schoolQuery.data]);

  if (!schoolIdValid) {
    return (
      <div className="p-6">
        <RouteInvalidRecovery
          backTo="/schools"
          linkLabel={ptBR.entities.schools}
        />
      </div>
    );
  }

  if (schoolQuery.isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (schoolQuery.isError || !schoolQuery.data) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600" role="alert">
          Escola não encontrada.
        </p>
        <Link
          to="/schools"
          className={cn(
            buttonVariants({ variant: "link" }),
            "mt-2 inline-block",
          )}
        >
          ← {ptBR.entities.schools}
        </Link>
      </div>
    );
  }

  const s = schoolQuery.data;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-medium">
          {s.title?.trim() ||
            `${ptBR.entities.school} ${schoolId.slice(0, 8)}…`}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1 px-2"
          onClick={() => requestCloseDetail()}
          aria-label={ptBR.listDetail.detailClose}
        >
          <XIcon className="size-4 shrink-0" aria-hidden />
        </Button>
      </div>

      <SchoolForm
        mode="edit"
        school={s}
        onSuccess={async () => {
          await qc.invalidateQueries({
            queryKey: queryKeys.school(schoolId),
          });
          await qc.invalidateQueries({
            queryKey: queryKeys.schools(includeInactive),
          });
        }}
      />
    </div>
  );
}
