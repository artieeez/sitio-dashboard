import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { WixIntegrationKeyFields } from "@/components/wix/wix-integration-key-fields";
import { WixPaymentEventsListPane } from "@/components/wix/wix-payment-events-list-pane";
import { isUuid } from "@/lib/uuid";

export const Route = createFileRoute("/schools/$schoolId/integrations/wix")({
  component: WixIntegrationShell,
});

function WixIntegrationShell() {
  const { schoolId } = Route.useParams();
  const navigate = useNavigate();
  const { eventId } = useParams({ strict: false }) as { eventId?: string };

  const selectedKey = useMemo(() => {
    if (eventId && isUuid(eventId)) return eventId;
    return null;
  }, [eventId]);

  const narrowDetailPane = selectedKey == null;

  const onSelectedKeyChange = useCallback(
    (key: string | null) => {
      if (key == null) {
        void navigate({
          to: "/schools/$schoolId/integrations/wix",
          params: { schoolId },
        });
        return;
      }
      if (isUuid(key)) {
        void navigate({
          to: "/schools/$schoolId/integrations/wix/$eventId",
          params: { schoolId, eventId: key },
        });
      }
    },
    [navigate, schoolId],
  );

  const [publicKey, setPublicKey] = useState("");
  const [privateApiKey, setPrivateApiKey] = useState("");

  return (
    <ListDetailLayout
      narrowDetailPane={narrowDetailPane}
      selectedKey={selectedKey}
      onSelectedKeyChange={onSelectedKeyChange}
      disableLocalUnsavedGuard
      list={
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
          <div className="shrink-0 px-4 pt-4">
            <WixIntegrationKeyFields
              publicKey={publicKey}
              privateApiKey={privateApiKey}
              onPublicKeyChange={setPublicKey}
              onPrivateApiKeyChange={setPrivateApiKey}
            />
          </div>
          <WixPaymentEventsListPane schoolId={schoolId} />
        </div>
      }
      detail={<Outlet />}
    />
  );
}
