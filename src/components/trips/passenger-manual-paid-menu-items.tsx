import { usePassengerManualPaidWithoutInfoMutation } from "@/hooks/use-passenger-manual-paid-without-info-mutation";
import type { PassengerWithStatus } from "@/lib/schemas/passenger";
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

  const setManual = usePassengerManualPaidWithoutInfoMutation({
    tripId,
    passengerId: passenger.id,
    onNotify: onManualPaidError,
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
