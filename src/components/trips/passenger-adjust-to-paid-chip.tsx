import { HandCoins } from "lucide-react";
import { useState } from "react";

import { usePassengerManualPaidWithoutInfoMutation } from "@/hooks/use-passenger-manual-paid-without-info-mutation";
import type { PassengerWithStatus } from "@/lib/schemas/passenger";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

export function PassengerAdjustToPaidChip(props: {
  tripId: string;
  passenger: PassengerWithStatus;
}) {
  const { tripId, passenger } = props;
  const [error, setError] = useState<string | null>(null);

  const setManual = usePassengerManualPaidWithoutInfoMutation({
    tripId,
    passengerId: passenger.id,
    onNotify: setError,
  });

  const show =
    passenger.status === "pending" &&
    passenger.removedAt == null &&
    !passenger.manualPaidWithoutInfo;

  if (!show) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <button
        type="button"
        disabled={setManual.isPending}
        onClick={() => setManual.mutate(true)}
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed px-2 py-0.5 font-medium text-muted-foreground text-xs transition-colors",
          "border-muted-foreground/50 hover:border-foreground/40 hover:bg-muted/60 hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
        aria-label={ptBR.actions.adjustToPaid}
      >
        <HandCoins className="size-3.5 shrink-0" aria-hidden />
        {ptBR.actions.adjustToPaid}
      </button>
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
