import { createContext, type ReactNode, useContext } from "react";

/** List-detail `selectedKey` when the configuration child route is active. */
export const WIX_CONFIG_SELECTED_KEY = "__wix_configuration__";

export type WixIntegrationConfigContextValue = {
  /** First chars of stored public key; full key is never held client-side. */
  publicKeyPrefix: string | null;
  privateApiKeyPrefix: string | null;
  isLoading: boolean;
  setPublicKey: (value: string) => void;
  setPrivateApiKey: (value: string) => void;
};

const WixIntegrationConfigContext =
  createContext<WixIntegrationConfigContextValue | null>(null);

export function WixIntegrationConfigProvider({
  value,
  children,
}: {
  value: WixIntegrationConfigContextValue;
  children: ReactNode;
}) {
  return (
    <WixIntegrationConfigContext.Provider value={value}>
      {children}
    </WixIntegrationConfigContext.Provider>
  );
}

export function useWixIntegrationConfig(): WixIntegrationConfigContextValue {
  const ctx = useContext(WixIntegrationConfigContext);
  if (!ctx) {
    throw new Error(
      "useWixIntegrationConfig must be used within WixIntegrationConfigProvider",
    );
  }
  return ctx;
}
