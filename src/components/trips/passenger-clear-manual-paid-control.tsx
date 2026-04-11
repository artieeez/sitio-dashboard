import { Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePassengerManualPaidWithoutInfoMutation } from "@/hooks/use-passenger-manual-paid-without-info-mutation";
import type { PassengerWithStatus } from "@/lib/schemas/passenger";
import { ptBR } from "@/messages/pt-BR";

export function PassengerClearManualPaidControl(props: {
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

  const show = passenger.manualPaidWithoutInfo && passenger.removedAt == null;

  if (!show) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={setManual.isPending}
        onClick={() => setManual.mutate(false)}
        className="h-auto w-fit gap-1.5 px-2 py-1 font-normal text-muted-foreground text-xs hover:text-foreground"
      >
        <Undo2 className="size-3.5 shrink-0" aria-hidden />
        {ptBR.actions.clearManualPaid}
      </Button>
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
