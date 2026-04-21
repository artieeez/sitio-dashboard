import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { type Trip, tripDeleteEligibilitySchema } from "@/lib/schemas/trip";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

function tripDisplayName(t: Trip): string {
  return t.title?.trim() || `${ptBR.entities.trip} ${t.id.slice(0, 8)}…`;
}

export type DeleteTripDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
  schoolId: string;
  /** After successful delete (e.g. clear list selection, navigate away). */
  onDeleted?: (tripId: string) => void;
};

export function DeleteTripDialog(props: DeleteTripDialogProps) {
  const { open, onOpenChange, trip, schoolId, onDeleted } = props;
  const qc = useQueryClient();
  const includeInactive = useUiPreferencesStore((s) => s.includeInactiveTrips);
  const copy = ptBR.deleteTripDialog;

  const eligibilityQuery = useQuery({
    queryKey: queryKeys.tripDeleteEligibility(trip?.id ?? ""),
    queryFn: async () => {
      const id = trip?.id;
      if (!id) {
        throw new Error("Trip id required for delete eligibility");
      }
      const raw = await apiJson<unknown>(`/trips/${id}/delete-eligibility`);
      return tripDeleteEligibilitySchema.parse(raw);
    },
    enabled: open && trip != null,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const id = trip?.id;
      if (!id) {
        throw new Error("Trip id required for delete");
      }
      await apiDelete(`/trips/${id}`);
    },
    onSuccess: async () => {
      const id = trip?.id;
      if (id) {
        onDeleted?.(id);
        await qc.removeQueries({ queryKey: queryKeys.trip(id) });
        await qc.removeQueries({
          queryKey: queryKeys.tripDeleteEligibility(id),
        });
        await qc.invalidateQueries({
          queryKey: queryKeys.trips(schoolId, includeInactive),
        });
      }
      onOpenChange(false);
    },
  });

  const el = eligibilityQuery.data;
  const loading = eligibilityQuery.isPending;
  const canConfirm = el?.canDelete === true && !deleteMutation.isPending;

  const bodyText =
    el && !el.canDelete && el.passengerCount > 0
      ? copy.cannotWithPassengers(el.passengerCount)
      : null;

  const err = deleteMutation.error;
  const errStatus = err instanceof ApiError ? err.status : null;
  const deleteError =
    err != null
      ? errStatus === 409
        ? copy.deleteConflict
        : copy.deleteFailed
      : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !deleteMutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <AlertDialogContent
        className="data-[size=default]:sm:max-w-lg"
        data-testid="delete-trip-dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          {trip ? (
            <AlertDialogDescription>
              {copy.intro(tripDisplayName(trip))}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <p className="text-muted-foreground">{copy.checking}</p>
            </div>
          ) : eligibilityQuery.isError ? (
            <p className="text-destructive" role="alert">
              {copy.eligibilityError}
            </p>
          ) : bodyText ? (
            <p
              className={
                el && !el.canDelete
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            >
              {bodyText}
            </p>
          ) : el?.canDelete ? (
            <p className="text-muted-foreground">{copy.readyHint}</p>
          ) : null}
          {deleteError ? (
            <p className="text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {ptBR.actions.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!trip || !canConfirm || loading}
            onClick={() => deleteMutation.mutate()}
          >
            {ptBR.actions.deletePermanently}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
