import { Eye, EyeOff, SquarePen } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ptBR } from "@/messages/pt-BR";

export type WixIntegrationKeyFieldsProps = {
  /** Wix App ID as returned by the API (OAuth app identifier). */
  appId: string | null;
  /** Full public key as returned by the API (for webhook setup). */
  publicKey: string | null;
  privateApiKeyPrefix: string | null;
  isLoading?: boolean;
  onAppIdChange: (value: string) => void;
  onPublicKeyChange: (value: string) => void;
  onPrivateApiKeyChange: (value: string) => void;
};

const PRIVATE_KEY_VISIBLE_LEN = 10;

/** Private key: first chars plus censored tail (API never returns the full secret). */
function formatMaskedFromPrefix(prefix: string | null): string {
  if (!prefix) return "";
  const p = prefix.slice(0, PRIVATE_KEY_VISIBLE_LEN);
  return `${p}${"•".repeat(10)}`;
}

export function WixIntegrationKeyFields({
  appId,
  publicKey,
  privateApiKeyPrefix,
  isLoading = false,
  onAppIdChange,
  onPublicKeyChange,
  onPrivateApiKeyChange,
}: WixIntegrationKeyFieldsProps) {
  const baseId = useId();
  const appIdFieldId = `${baseId}-app-id`;
  const publicId = `${baseId}-public`;
  const privateId = `${baseId}-private`;

  const [editingAppId, setEditingAppId] = useState(false);
  const [editingPublic, setEditingPublic] = useState(false);
  const [editingPrivate, setEditingPrivate] = useState(false);
  const [draftAppId, setDraftAppId] = useState("");
  const [draftPublic, setDraftPublic] = useState("");
  const [draftPrivate, setDraftPrivate] = useState("");
  const [privateVisible, setPrivateVisible] = useState(false);

  useEffect(() => {
    if (editingAppId) setDraftAppId("");
  }, [editingAppId]);

  useEffect(() => {
    if (editingPublic) setDraftPublic("");
  }, [editingPublic]);

  useEffect(() => {
    if (editingPrivate) {
      setDraftPrivate("");
      setPrivateVisible(false);
    }
  }, [editingPrivate]);

  const applyAppId = () => {
    const next = draftAppId.trim();
    if (next) onAppIdChange(next);
    setEditingAppId(false);
  };

  const applyPublic = () => {
    const next = draftPublic.trim();
    if (next) onPublicKeyChange(next);
    setEditingPublic(false);
  };

  const applyPrivate = () => {
    const next = draftPrivate.trim();
    if (next) onPrivateApiKeyChange(next);
    setEditingPrivate(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2">
        <label
          htmlFor={editingAppId ? appIdFieldId : undefined}
          className="font-medium text-sm"
        >
          {ptBR.wixIntegration.keys.appId}
        </label>
        {editingAppId ? (
          <div className="flex flex-col gap-2">
            <Input
              id={appIdFieldId}
              name="wixAppId"
              autoComplete="off"
              value={draftAppId}
              onChange={(e) => setDraftAppId(e.target.value)}
              placeholder={ptBR.wixIntegration.keys.appIdPlaceholder}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={applyAppId}>
                {ptBR.wixIntegration.keys.applyKey}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingAppId(false)}
              >
                {ptBR.wixIntegration.keys.cancelEdit}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-start gap-2">
            <section
              className="border-input bg-muted/40 min-h-9 min-w-0 flex-1 rounded-md border px-3 py-2 font-mono text-sm break-all"
              aria-label={ptBR.wixIntegration.keys.appId}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="bg-muted h-4 max-w-48 animate-pulse rounded" />
              ) : appId ? (
                appId
              ) : (
                <span className="text-muted-foreground">
                  {ptBR.wixIntegration.keys.keyNotSet}
                </span>
              )}
            </section>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="shrink-0"
              disabled={isLoading}
              aria-label={ptBR.wixIntegration.keys.editKey}
              onClick={() => setEditingAppId(true)}
            >
              <SquarePen aria-hidden className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <label
          htmlFor={editingPublic ? publicId : undefined}
          className="font-medium text-sm"
        >
          {ptBR.wixIntegration.keys.publicKey}
        </label>
        {editingPublic ? (
          <div className="flex flex-col gap-2">
            <Input
              id={publicId}
              name="wixPublicKey"
              autoComplete="off"
              value={draftPublic}
              onChange={(e) => setDraftPublic(e.target.value)}
              placeholder={ptBR.wixIntegration.keys.publicKeyPlaceholder}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={applyPublic}>
                {ptBR.wixIntegration.keys.applyKey}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingPublic(false)}
              >
                {ptBR.wixIntegration.keys.cancelEdit}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-start gap-2">
            <section
              className="border-input bg-muted/40 min-h-9 min-w-0 flex-1 rounded-md border px-3 py-2 font-mono text-sm break-all"
              aria-label={ptBR.wixIntegration.keys.publicKey}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="bg-muted h-4 max-w-48 animate-pulse rounded" />
              ) : publicKey ? (
                publicKey
              ) : (
                <span className="text-muted-foreground">
                  {ptBR.wixIntegration.keys.keyNotSet}
                </span>
              )}
            </section>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="shrink-0"
              disabled={isLoading}
              aria-label={ptBR.wixIntegration.keys.editKey}
              onClick={() => setEditingPublic(true)}
            >
              <SquarePen aria-hidden className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={editingPrivate ? privateId : undefined}
            className="font-medium text-sm"
          >
            {ptBR.wixIntegration.keys.privateKey}
          </label>
          {editingPrivate ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => setPrivateVisible((v) => !v)}
            >
              {privateVisible ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
              {privateVisible
                ? ptBR.wixIntegration.keys.hidePrivate
                : ptBR.wixIntegration.keys.revealPrivate}
            </Button>
          ) : null}
        </div>
        {editingPrivate ? (
          <div className="flex flex-col gap-2">
            <Input
              id={privateId}
              name="wixPrivateApiKey"
              autoComplete="off"
              type={privateVisible ? "text" : "password"}
              value={draftPrivate}
              onChange={(e) => setDraftPrivate(e.target.value)}
              placeholder={ptBR.wixIntegration.keys.privateKeyPlaceholder}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={applyPrivate}>
                {ptBR.wixIntegration.keys.applyKey}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingPrivate(false)}
              >
                {ptBR.wixIntegration.keys.cancelEdit}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-start gap-2">
            <section
              className="border-input bg-muted/40 min-h-9 min-w-0 flex-1 rounded-md border px-3 py-2 font-mono text-sm break-all"
              aria-label={ptBR.wixIntegration.keys.privateKey}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="bg-muted h-4 max-w-48 animate-pulse rounded" />
              ) : privateApiKeyPrefix ? (
                formatMaskedFromPrefix(privateApiKeyPrefix)
              ) : (
                <span className="text-muted-foreground">
                  {ptBR.wixIntegration.keys.keyNotSet}
                </span>
              )}
            </section>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="shrink-0"
              disabled={isLoading}
              aria-label={ptBR.wixIntegration.keys.editKey}
              onClick={() => setEditingPrivate(true)}
            >
              <SquarePen aria-hidden className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
