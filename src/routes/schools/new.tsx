import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { DetailPanePageHeader } from "@/components/layout/detail-pane-page-header";
import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { SchoolForm } from "@/components/schools/SchoolForm";
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
      <DetailPanePageHeader
        title={`${ptBR.actions.create} ${ptBR.entities.school}`}
        onClose={requestCloseDetail}
      />

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
