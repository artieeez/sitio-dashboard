import { useNavigate } from "@tanstack/react-router";
import { Pencil, Power, PowerOff, Share2, Trash2, Users } from "lucide-react";
import { useMemo } from "react";

import {
  RowKebabMenu,
  type RowKebabMenuItem,
} from "@/components/ui/row-kebab-menu";
import type { Trip } from "@/lib/schemas/trip";
import { passengersListLink, tripSummaryLink } from "@/lib/trip-payment-links";
import { ptBR } from "@/messages/pt-BR";

export function TripWorkspaceListOptionsMenu(props: {
  trip: Trip;
  /**
   * When set, “Ver passageiros” / “Editar” use `/schools/.../trips/...` routes; when
   * omitted, use global `/trips/...` links (URL has no school scope).
   */
  schoolScopeForLinks?: string;
  openActivateDialog: () => void;
  openDeactivateDialog: () => void;
  openDeleteDialog: () => void;
  /**
   * When set (e.g. school trips table), include “Ver passageiros” and horizontal ⋯ in dense cells.
   */
  showViewPassengers?: boolean;
}) {
  const navigate = useNavigate();
  const {
    trip,
    schoolScopeForLinks,
    openActivateDialog,
    openDeactivateDialog,
    openDeleteDialog,
    showViewPassengers,
  } = props;
  const tripId = trip.id;

  const items = useMemo((): RowKebabMenuItem[] => {
    const out: RowKebabMenuItem[] = [];
    if (showViewPassengers && schoolScopeForLinks) {
      out.push({
        id: "passengers",
        icon: <Users className="text-muted-foreground" aria-hidden />,
        label: ptBR.actions.viewPassengers,
        onClick: () => {
          void navigate(
            passengersListLink({
              tripId,
              schoolId: schoolScopeForLinks,
            }),
          );
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
          void navigate(
            tripSummaryLink({ tripId, schoolId: schoolScopeForLinks }),
          );
        },
      },
      {
        id: "share",
        icon: <Share2 className="text-muted-foreground" aria-hidden />,
        label: ptBR.actions.share,
        disabled: true,
      },
    );
    if (trip.active) {
      out.push({
        id: "deactivate",
        icon: <PowerOff className="text-muted-foreground" aria-hidden />,
        label: (
          <>
            {ptBR.actions.deactivate} {ptBR.entities.trip}
          </>
        ),
        onClick: () => openDeactivateDialog(),
      });
    } else {
      out.push({
        id: "activate",
        icon: <Power className="text-muted-foreground" aria-hidden />,
        label: (
          <>
            {ptBR.actions.activate} {ptBR.entities.trip}
          </>
        ),
        onClick: () => openActivateDialog(),
      });
    }
    out.push({
      id: "delete-permanent",
      icon: <Trash2 className="text-destructive" aria-hidden />,
      label: (
        <span className="text-destructive">
          {ptBR.actions.deletePermanently} {ptBR.entities.trip}
        </span>
      ),
      destructive: true,
      onClick: () => openDeleteDialog(),
    });
    return out;
  }, [
    tripId,
    trip.active,
    schoolScopeForLinks,
    showViewPassengers,
    navigate,
    openActivateDialog,
    openDeactivateDialog,
    openDeleteDialog,
  ]);

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
