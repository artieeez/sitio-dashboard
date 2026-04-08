import { createFileRoute } from "@tanstack/react-router";

import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute("/schools/$schoolId/trips/")({
  component: SchoolTripsIndexDetailPlaceholder,
});

function SchoolTripsIndexDetailPlaceholder() {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      {ptBR.listDetail.selectTripPrompt}
    </div>
  );
}
