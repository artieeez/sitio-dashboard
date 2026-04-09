import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";
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

  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const handleDiscardDirty = useCallback(() => {
    setWorkspaceDirty(false);
    setFormKey((k) => k + 1);
  }, []);

  return (
    <WorkspaceDirtyProvider setWorkspaceDirty={setWorkspaceDirty}>
      <NavigationUnsavedGuard
        isDirty={workspaceDirty}
        onDiscard={handleDiscardDirty}
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <Link
            to="/schools"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {ptBR.entities.schools}
          </Link>
          <h1 className="text-lg font-medium">
            {ptBR.actions.create} {ptBR.entities.school}
          </h1>
        </header>

        <SchoolForm
          key={formKey}
          mode="create"
          onSuccess={async () => {
            await qc.invalidateQueries({
              queryKey: queryKeys.schools(includeInactive),
            });
            await navigate({ to: "/schools" });
          }}
        />
      </div>
    </WorkspaceDirtyProvider>
  );
}
