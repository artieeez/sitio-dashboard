import { createFileRoute } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { Button } from "@/components/ui/button";
import { useWixIntegrationConfig } from "@/components/wix/wix-integration-config-context";
import { WixIntegrationKeyFields } from "@/components/wix/wix-integration-key-fields";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/schools/$schoolId/integrations/wix/configuration",
)({
  component: WixConfigurationDetailRoute,
});

function WixConfigurationDetailRoute() {
  const { requestCloseDetail } = useListDetailLayout();
  const { publicKey, privateApiKey, setPublicKey, setPrivateApiKey } =
    useWixIntegrationConfig();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 font-medium text-base">
            {ptBR.wixIntegration.settingsSheetTitle}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1 px-2"
            onClick={() => requestCloseDetail()}
            aria-label={ptBR.listDetail.detailClose}
          >
            <XIcon className="size-4 shrink-0" aria-hidden />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          {ptBR.wixIntegration.settingsSheetDescription}
        </p>
      </div>
      <WixIntegrationKeyFields
        publicKey={publicKey}
        privateApiKey={privateApiKey}
        onPublicKeyChange={setPublicKey}
        onPrivateApiKeyChange={setPrivateApiKey}
      />
    </div>
  );
}
