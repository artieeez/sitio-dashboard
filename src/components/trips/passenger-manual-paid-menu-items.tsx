import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiPutJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  type PassengerWithStatus,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
import { ptBR } from "@/messages/pt-BR";

/**
 * “Pago sem informações” toggle as kebab menu items (was a table column).
 */
export function PassengerManualPaidMenuItems(props: {
  tripId: string;
  passenger: PassengerWithStatus;
  onManualPaidError?: (message: string | null) => void;
}) {
  const { tripId, passenger, onManualPaidError } = props;
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
      onManualPaidError?.(null);
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
    onError: (e: unknown) => {
      const msg =
        e instanceof ApiError
          ? (e.body as { message?: string } | null)?.message
          : null;
      onManualPaidError?.(
        typeof msg === "string" && msg.length > 0
          ? msg
          : "Não foi possível atualizar o pago manual.",
      );
    },
  });

  return (
    <button
      type="button"
      role="menuitem"
      className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
      disabled={setManual.isPending || passenger.removedAt !== null}
      onClick={() => setManual.mutate(!passenger.manualPaidWithoutInfo)}
    >
      {passenger.manualPaidWithoutInfo
        ? ptBR.actions.clearManualPaid
        : ptBR.actions.markManualPaid}
    </button>
  );
}
