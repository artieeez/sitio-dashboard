import { createFileRoute } from "@tanstack/react-router";

import { WixPaymentEventDetailPane } from "@/components/wix/wix-payment-event-detail-pane";
import { isUuid } from "@/lib/uuid";
import { findWixPaymentEventListItemById } from "@/lib/wix-payment-events.fixtures";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/schools/$schoolId/integrations/wix/$eventId",
)({
  component: WixEventDetailRoute,
});

function WixEventDetailRoute() {
  const { eventId } = Route.useParams();

  if (!isUuid(eventId)) {
    return (
      <div className="p-4 text-sm text-muted-foreground" role="alert">
        {ptBR.shell.invalidRoute}
      </div>
    );
  }

  const row = findWixPaymentEventListItemById(eventId);
  if (!row) {
    return (
      <div className="p-4 text-sm text-muted-foreground" role="status">
        {ptBR.shell.invalidRoute}
      </div>
    );
  }

  return <WixPaymentEventDetailPane event={row.event} />;
}
