import { useNavigate } from "@tanstack/react-router";
import { Pencil, Share2, Trash2, Users } from "lucide-react";
import { useMemo } from "react";

import {
  type RowKebabMenuItem,
  RowKebabMenu,
} from "@/components/ui/row-kebab-menu";
import { passengersListLink, tripSummaryLink } from "@/lib/trip-payment-links";
import { ptBR } from "@/messages/pt-BR";

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

  const items = useMemo((): RowKebabMenuItem[] => {
    const scope = { tripId, ...(schoolId ? { schoolId } : {}) };
    const out: RowKebabMenuItem[] = [];
    if (showViewPassengers && schoolId) {
      out.push({
        id: "passengers",
        icon: <Users className="text-muted-foreground" aria-hidden />,
        label: ptBR.actions.viewPassengers,
        onClick: () => {
          void navigate(passengersListLink({ tripId, schoolId }));
        },
      });
    }
    out.push(
      {
        id: "edit-trip",
        icon: <Pencil className="text-muted-foreground" aria-hidden />,
        label: (
          <>
            {ptBR.actions.edit} {ptBR.entities.trip}
          </>
        ),
        onClick: () => {
          void navigate(tripSummaryLink(scope));
        },
      },
      {
        id: "share",
        icon: <Share2 className="text-muted-foreground" aria-hidden />,
        label: ptBR.actions.share,
        disabled: true,
      },
      {
        id: "delete",
        icon: <Trash2 className="text-muted-foreground" aria-hidden />,
        label: (
          <>
            {ptBR.actions.delete} {ptBR.entities.trip}
          </>
        ),
        onClick: () => {
          /* trip delete not implemented */
        },
      },
    );
    return out;
  }, [tripId, schoolId, showViewPassengers, navigate]);

  return (
    <RowKebabMenu
      ariaLabel={
        showViewPassengers
          ? ptBR.aria.rowMenu
          : ptBR.tripWorkspace.optionsMenuAria
      }
      iconOrientation={showViewPassengers ? "horizontal" : undefined}
      items={items}
    />
  );
}
