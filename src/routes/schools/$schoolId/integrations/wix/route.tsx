import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
  useRouterState,
} from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import {
  WIX_CONFIG_SELECTED_KEY,
  WixIntegrationConfigProvider,
} from "@/components/wix/wix-integration-config-context";
import { WixPaymentEventsListPane } from "@/components/wix/wix-payment-events-list-pane";
import { apiJson, apiPatchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { wixIntegrationSettingsSchema } from "@/lib/schemas/wix-integration";
import { isUuid } from "@/lib/uuid";

export const Route = createFileRoute("/schools/$schoolId/integrations/wix")({
  component: WixIntegrationShell,
});

function WixIntegrationShell() {
  const { schoolId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { eventId } = useParams({ strict: false }) as { eventId?: string };

  const wixQuery = useQuery({
    queryKey: queryKeys.wixIntegration(),
    queryFn: async () => {
      const raw = await apiJson<unknown>("/integrations/wix");
      return wixIntegrationSettingsSchema.parse(raw);
    },
  });

  const { mutate: patchWix } = useMutation({
    mutationFn: async (body: { publicKey?: string; privateApiKey?: string }) => {
      const raw = await apiPatchJson<unknown>("/integrations/wix", body);
      return wixIntegrationSettingsSchema.parse(raw);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.wixIntegration(), data);
    },
  });

  const isConfigurationRoute = useMemo(() => {
    const base = `/schools/${schoolId}/integrations/wix/configuration`;
    return pathname === base || pathname === `${base}/`;
  }, [pathname, schoolId]);

  const selectedKey = useMemo(() => {
    if (isConfigurationRoute) return WIX_CONFIG_SELECTED_KEY;
    if (eventId && isUuid(eventId)) return eventId;
    return null;
  }, [isConfigurationRoute, eventId]);

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
      if (key === WIX_CONFIG_SELECTED_KEY) {
        void navigate({
          to: "/schools/$schoolId/integrations/wix/configuration",
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

  const configValue = useMemo(
    () => ({
      publicKey: wixQuery.data?.publicKey ?? null,
      privateApiKeyPrefix: wixQuery.data?.privateApiKeyPrefix ?? null,
      isLoading: wixQuery.isPending,
      setPublicKey: (value: string) => {
        patchWix({ publicKey: value });
      },
      setPrivateApiKey: (value: string) => {
        patchWix({ privateApiKey: value });
      },
    }),
    [wixQuery.data, wixQuery.isPending, patchWix],
  );

  return (
    <WixIntegrationConfigProvider value={configValue}>
      <ListDetailLayout
        narrowDetailPane={narrowDetailPane}
        selectedKey={selectedKey}
        onSelectedKeyChange={onSelectedKeyChange}
        disableLocalUnsavedGuard
        list={
          <div className="flex min-h-0 min-w-0 flex-1 flex-col basis-0">
            <WixPaymentEventsListPane schoolId={schoolId} />
          </div>
        }
        detail={<Outlet />}
      />
    </WixIntegrationConfigProvider>
  );
}
