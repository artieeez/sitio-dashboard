import type { ReactNode } from "react";

import { DetailPanePageHeader } from "@/components/layout/detail-pane-page-header";
import { TripForm } from "@/components/trips/TripForm";
import type { Trip } from "@/lib/schemas/trip";
import { ptBR } from "@/messages/pt-BR";

export type TripFormWorkspaceMode = "create" | "edit";

export type TripFormWorkspaceProps = {
  mode: TripFormWorkspaceMode;
  schoolId: string;
  trip?: Trip;
  onSuccess: () => void;
  onClose: () => void;
  /** Shown under the title (e.g. create-flow helper copy). */
  headerSubtitle?: ReactNode;
};

/**
 * Shared list–detail shell for trip create and edit so header + layout stay aligned.
 * The actual fields live in {@link TripForm}.
 */
export function TripFormWorkspace({
  mode,
  schoolId,
  trip,
  onSuccess,
  onClose,
  headerSubtitle,
}: TripFormWorkspaceProps) {
  const title =
    mode === "create"
      ? `${ptBR.actions.create} ${ptBR.entities.trip}`
      : `${ptBR.actions.edit} ${ptBR.entities.trip}`;

  return (
    <div className="min-w-0 p-6">
      <div className="flex w-full min-w-0 max-w-xl flex-col gap-6">
        <DetailPanePageHeader
          className="mb-0"
          rowLayout="loose"
          title={title}
          onClose={onClose}
          subtitle={headerSubtitle}
        />
        <TripForm
          mode={mode}
          schoolId={schoolId}
          trip={trip}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
