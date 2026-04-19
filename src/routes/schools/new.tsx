import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/schools/new")({
  component: NewSchoolPage,
});

function NewSchoolPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const includeInactive = useUiPreferencesStore(
    (s) => s.includeInactiveSchools,
  );
  const { requestCloseDetail } = useListDetailLayout();

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-medium">
            {ptBR.actions.create} {ptBR.entities.school}
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
      </header>

      <SchoolForm
        mode="create"
        onSuccess={async () => {
          await qc.invalidateQueries({
            queryKey: queryKeys.schools(includeInactive),
          });
          await navigate({ to: "/schools" });
        }}
      />
    </div>
  );
}
