import { useNavigate } from "@tanstack/react-router";
import { Pencil, Share2, Trash2, Users } from "lucide-react";

import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { passengersListLink, tripSummaryLink } from "@/lib/trip-payment-links";
import { ptBR } from "@/messages/pt-BR";

const menuItemClass =
  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export function TripWorkspaceListOptionsMenu(props: {
  tripId: string;
  schoolId?: string;
  /**
   * School trips table: include “Ver passageiros” and use horizontal ⋯ in dense cells.
   */
  showViewPassengers?: boolean;
}) {
  const navigate = useNavigate();
  const { tripId, schoolId, showViewPassengers } = props;
  const scope = { tripId, ...(schoolId ? { schoolId } : {}) };

  const items = (
    <>
      {showViewPassengers && schoolId ? (
        <button
          type="button"
          role="menuitem"
          className={menuItemClass}
          onClick={() => {
            void navigate(passengersListLink({ tripId, schoolId }));
          }}
        >
          <Users className="text-muted-foreground" aria-hidden />
          {ptBR.actions.viewPassengers}
        </button>
      ) : null}
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => {
          void navigate(tripSummaryLink(scope));
        }}
      >
        <Pencil className="text-muted-foreground" aria-hidden />
        {ptBR.actions.edit} {ptBR.entities.trip}
      </button>
      <button
        type="button"
        role="menuitem"
        disabled
        className={`${menuItemClass} cursor-not-allowed opacity-50`}
        aria-disabled="true"
      >
        <Share2 className="text-muted-foreground" aria-hidden />
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
        <Trash2 className="text-muted-foreground" aria-hidden />
        {ptBR.actions.delete} {ptBR.entities.trip}
      </button>
    </>
  );

  return (
    <RowKebabMenu
      ariaLabel={
        showViewPassengers
          ? ptBR.aria.rowMenu
          : ptBR.tripWorkspace.optionsMenuAria
      }
      iconOrientation={showViewPassengers ? "horizontal" : undefined}
    >
      {items}
    </RowKebabMenu>
  );
}
