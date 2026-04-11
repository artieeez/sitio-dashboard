import { useNavigate } from "@tanstack/react-router";

import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { tripSummaryLink } from "@/lib/trip-payment-links";
import { ptBR } from "@/messages/pt-BR";

const menuItemClass =
  "w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted";

export function TripWorkspaceListOptionsMenu(props: {
  tripId: string;
  schoolId?: string;
}) {
  const navigate = useNavigate();
  const { tripId, schoolId } = props;
  const scope = { tripId, ...(schoolId ? { schoolId } : {}) };

  return (
    <RowKebabMenu ariaLabel={ptBR.tripWorkspace.optionsMenuAria}>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => {
          void navigate(tripSummaryLink(scope));
        }}
      >
        {ptBR.actions.edit} {ptBR.entities.trip}
      </button>
      <button
        type="button"
        role="menuitem"
        disabled
        className={`${menuItemClass} cursor-not-allowed opacity-50`}
        aria-disabled="true"
      >
        {ptBR.actions.share}
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => {
          /* trip delete not implemented */
        }}
      >
        {ptBR.actions.delete} {ptBR.entities.trip}
      </button>
    </RowKebabMenu>
  );
}
