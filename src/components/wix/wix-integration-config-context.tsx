import { createContext, type ReactNode, useContext } from "react";

/** List-detail `selectedKey` when the configuration child route is active. */
export const WIX_CONFIG_SELECTED_KEY = "__wix_configuration__";

export type WixIntegrationConfigContextValue = {
  /** Wix App ID from the dashboard (returned by the API in full). */
  appId: string | null;
  /** Full public key for webhook signing (returned by the API). */
  publicKey: string | null;
  /** First 10 characters of the private key (API only; full secret never sent). */
  privateApiKeyPrefix: string | null;
  isLoading: boolean;
  setAppId: (value: string) => void;
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
