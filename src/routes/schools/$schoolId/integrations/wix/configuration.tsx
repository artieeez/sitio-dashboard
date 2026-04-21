import { createFileRoute } from "@tanstack/react-router";

import { DetailPanePageHeader } from "@/components/layout/detail-pane-page-header";
import { useListDetailLayout } from "@/components/layout/list-detail-layout";
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
  const {
    publicKey,
    privateApiKeyPrefix,
    isLoading,
    setPublicKey,
    setPrivateApiKey,
  } = useWixIntegrationConfig();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="space-y-1">
        <DetailPanePageHeader
          variant="panel"
          rowLayout="panel"
          title={ptBR.wixIntegration.settingsSheetTitle}
          onClose={requestCloseDetail}
        />
        <p className="text-muted-foreground text-sm">
          {ptBR.wixIntegration.settingsSheetDescription}
        </p>
      </div>
      <WixIntegrationKeyFields
        publicKey={publicKey}
        privateApiKeyPrefix={privateApiKeyPrefix}
        isLoading={isLoading}
        onPublicKeyChange={setPublicKey}
        onPrivateApiKeyChange={setPrivateApiKey}
      />
    </div>
  );
}
