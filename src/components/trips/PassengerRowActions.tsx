import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ApiError, apiPutJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  type PassengerWithStatus,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
import { ptBR } from "@/messages/pt-BR";

export function PassengerRowActions(props: {
  tripId: string;
  passenger: PassengerWithStatus;
}) {
  const { tripId, passenger } = props;
  const qc = useQueryClient();

  const setManual = useMutation({
    mutationFn: async (enabled: boolean) => {
      const raw = await apiPutJson<unknown>(
        `/passengers/${passenger.id}/manual-paid-without-info`,
        { enabled },
      );
      return passengerWithStatusSchema.parse(raw);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, false),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, true),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.payments(passenger.id),
      });
      await qc.invalidateQueries({
        queryKey: ["passengerAggregates", tripId],
      });
    },
  });

  const err =
    setManual.error instanceof ApiError
      ? (setManual.error.body as { message?: string } | null)?.message
      : null;

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={setManual.isPending || passenger.removedAt !== null}
        onClick={() => setManual.mutate(!passenger.manualPaidWithoutInfo)}
      >
        {passenger.manualPaidWithoutInfo
          ? ptBR.actions.clearManualPaid
          : ptBR.actions.markManualPaid}
      </Button>
      {err ? (
        <span className="text-xs text-red-600" role="alert">
          {err}
        </span>
      ) : null}
    </div>
  );
}
