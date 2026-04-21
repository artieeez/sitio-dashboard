import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiPatchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { type Trip, tripSchema } from "@/lib/schemas/trip";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

function tripDisplayName(t: Trip): string {
  return t.title?.trim() || `${ptBR.entities.trip} ${t.id.slice(0, 8)}…`;
}

export type DeactivateTripDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
  schoolId: string;
};

export function DeactivateTripDialog(props: DeactivateTripDialogProps) {
  const { open, onOpenChange, trip, schoolId } = props;
  const qc = useQueryClient();
  const includeInactive = useUiPreferencesStore((s) => s.includeInactiveTrips);
  const copy = ptBR.deactivateTripDialog;

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const id = trip?.id;
      if (!id) {
        throw new Error("Trip id required for deactivate");
      }
      const raw = await apiPatchJson<unknown>(`/trips/${id}`, {
        active: false,
      });
      return tripSchema.parse(raw);
    },
    onSuccess: async () => {
      const id = trip?.id;
      await qc.invalidateQueries({
        queryKey: queryKeys.trips(schoolId, includeInactive),
      });
      if (id) {
        await qc.invalidateQueries({ queryKey: queryKeys.trip(id) });
        await qc.invalidateQueries({
          queryKey: queryKeys.tripDeleteEligibility(id),
        });
        await qc.invalidateQueries({
          queryKey: queryKeys.passengers(id, true),
        });
        await qc.invalidateQueries({
          queryKey: queryKeys.passengers(id, false),
        });
        await qc.invalidateQueries({
          queryKey: ["passengerAggregates", id],
        });
      }
      onOpenChange(false);
    },
  });

  const err = deactivateMutation.error;
  const errMessage = err != null ? copy.deactivateFailed : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !deactivateMutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <AlertDialogContent
        className="data-[size=default]:sm:max-w-lg"
        data-testid="deactivate-trip-dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          {trip ? (
            <AlertDialogDescription>
              {copy.intro(tripDisplayName(trip))}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        {trip ? (
          <p className="text-sm text-muted-foreground">{copy.hint}</p>
        ) : null}
        {errMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errMessage}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deactivateMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {ptBR.actions.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="secondary"
            disabled={!trip || deactivateMutation.isPending}
            onClick={() => deactivateMutation.mutate()}
          >
            {ptBR.actions.deactivate}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
