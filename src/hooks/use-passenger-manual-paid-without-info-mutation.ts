import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiPutJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";

export function usePassengerManualPaidWithoutInfoMutation(options: {
  tripId: string;
  passengerId: string;
  onNotify?: (message: string | null) => void;
}) {
  const { tripId, passengerId, onNotify } = options;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const raw = await apiPutJson<unknown>(
        `/passengers/${passengerId}/manual-paid-without-info`,
        { enabled },
      );
      return passengerWithStatusSchema.parse(raw);
    },
    onSuccess: async () => {
      onNotify?.(null);
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, false),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, true),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.payments(passengerId),
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
      onNotify?.(
        typeof msg === "string" && msg.length > 0
          ? msg
          : "Não foi possível atualizar o pago manual.",
      );
    },
  });
}
