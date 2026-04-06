import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerStatusAggregatesSchema } from "@/lib/schemas/trip";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export function TripStatusSummary(props: { tripId: string }) {
  const { tripId } = props;
  const includeRemoved = useUiPreferencesStore(
    (s) => s.includeRemovedPassengers,
  );

  const q = useQuery({
    queryKey: queryKeys.passengerAggregates(tripId, includeRemoved),
    queryFn: async () => {
      const qs = includeRemoved ? "?includeRemoved=true" : "";
      const raw = await apiJson<unknown>(
        `/trips/${tripId}/passenger-status-aggregates${qs}`,
      );
      return passengerStatusAggregatesSchema.parse(raw);
    },
  });

  if (q.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">{ptBR.shell.loading}</p>
    );
  }
  if (q.isError || !q.data) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {ptBR.shell.aggregatesError}
      </p>
    );
  }

  const a = q.data;
  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-label={ptBR.aggregates.title}
    >
      <h2 className="text-sm font-medium">{ptBR.aggregates.title}</h2>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-2 rounded-md bg-muted/40 px-2 py-1">
          <dt>{ptBR.status.pending}</dt>
          <dd className="tabular-nums font-medium">{a.pendingCount}</dd>
        </div>
        <div className="flex justify-between gap-2 rounded-md bg-muted/40 px-2 py-1">
          <dt>{ptBR.status.settledPayments}</dt>
          <dd className="tabular-nums font-medium">{a.settledPaymentsCount}</dd>
        </div>
        <div className="flex justify-between gap-2 rounded-md bg-muted/40 px-2 py-1">
          <dt>{ptBR.status.settledManual}</dt>
          <dd className="tabular-nums font-medium">{a.settledManualCount}</dd>
        </div>
        <div className="flex justify-between gap-2 rounded-md bg-muted/40 px-2 py-1">
          <dt>{ptBR.status.unavailable}</dt>
          <dd className="tabular-nums font-medium">{a.unavailableCount}</dd>
        </div>
      </dl>
    </section>
  );
}
