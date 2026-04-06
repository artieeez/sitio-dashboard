import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TripStatusSummary } from "@/components/trips/TripStatusSummary";

vi.mock("@/lib/api-client", () => ({
  apiJson: vi.fn().mockResolvedValue({
    pendingCount: 3,
    settledPaymentsCount: 4,
    settledManualCount: 0,
    unavailableCount: 7,
  }),
}));

vi.mock("@/stores/ui-preferences-store", () => ({
  useUiPreferencesStore: (
    selector: (s: { includeRemovedPassengers: boolean }) => unknown,
  ) => selector({ includeRemovedPassengers: false }),
}));

describe("Trip aggregates UI (US4)", () => {
  it("renders counts from the aggregates API response", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <TripStatusSummary tripId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );
    const region = await screen.findByRole("region", {
      name: /resumo por situação de pagamento/i,
    });
    expect(region).toBeInTheDocument();
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(await screen.findByText("4")).toBeInTheDocument();
    expect(await screen.findByText("7")).toBeInTheDocument();
  });
});
