import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";
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

export const Route = createFileRoute("/schools/$schoolId/home")({
  component: SchoolHomeDetailPage,
});

function SchoolHomeDetailPage() {
  const { schoolId } = Route.useParams();
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

  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const handleDiscardDirty = useCallback(() => {
    setWorkspaceDirty(false);
    setFormKey((k) => k + 1);
  }, []);

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
    <WorkspaceDirtyProvider setWorkspaceDirty={setWorkspaceDirty}>
      <NavigationUnsavedGuard
        isDirty={workspaceDirty}
        onDiscard={handleDiscardDirty}
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-medium">
              {s.title?.trim() ||
                `${ptBR.entities.school} ${schoolId.slice(0, 8)}…`}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/schools/$schoolId/trips"
              params={{ schoolId }}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              {ptBR.entities.trips}
            </Link>
            <Button
              variant="destructive"
              type="button"
              onClick={async () => {
                await apiDelete(`/schools/${schoolId}`);
                await qc.invalidateQueries({
                  queryKey: queryKeys.schools(includeInactive),
                });
                await navigate({ to: "/schools" });
              }}
            >
              {ptBR.actions.delete}
            </Button>
          </div>
        </div>

        <SchoolForm
          key={formKey}
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
    </WorkspaceDirtyProvider>
  );
}
