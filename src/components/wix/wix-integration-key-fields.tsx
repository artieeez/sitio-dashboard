import { Eye, EyeOff } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ptBR } from "@/messages/pt-BR";

export type WixIntegrationKeyFieldsProps = {
  publicKey: string;
  privateApiKey: string;
  onPublicKeyChange: (value: string) => void;
  onPrivateApiKeyChange: (value: string) => void;
};

/** First four characters plus a censored tail (does not reveal length precisely). */
function formatMaskedKey(key: string): string {
  if (!key) return "";
  const prefix = key.slice(0, 4);
  const tailDots = Math.max(6, Math.min(16, key.length));
  return `${prefix}${"•".repeat(tailDots)}`;
}

export function WixIntegrationKeyFields({
  publicKey,
  privateApiKey,
  onPublicKeyChange,
  onPrivateApiKeyChange,
}: WixIntegrationKeyFieldsProps) {
  const baseId = useId();
  const publicId = `${baseId}-public`;
  const privateId = `${baseId}-private`;

  const [editingPublic, setEditingPublic] = useState(false);
  const [editingPrivate, setEditingPrivate] = useState(false);
  const [draftPublic, setDraftPublic] = useState("");
  const [draftPrivate, setDraftPrivate] = useState("");
  const [privateVisible, setPrivateVisible] = useState(false);

  useEffect(() => {
    if (editingPublic) setDraftPublic("");
  }, [editingPublic]);

  useEffect(() => {
    if (editingPrivate) {
      setDraftPrivate("");
      setPrivateVisible(false);
    }
  }, [editingPrivate]);

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
        <label htmlFor={editingPublic ? publicId : undefined} className="font-medium text-sm">
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
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="border-input bg-muted/40 min-h-9 min-w-0 flex-1 rounded-md border px-3 py-2 font-mono text-sm break-all"
              aria-label={ptBR.wixIntegration.keys.publicKey}
            >
              {publicKey ? (
                formatMaskedKey(publicKey)
              ) : (
                <span className="text-muted-foreground">
                  {ptBR.wixIntegration.keys.keyNotSet}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setEditingPublic(true)}
            >
              {ptBR.wixIntegration.keys.editKey}
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
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="border-input bg-muted/40 min-h-9 min-w-0 flex-1 rounded-md border px-3 py-2 font-mono text-sm break-all"
              aria-label={ptBR.wixIntegration.keys.privateKey}
            >
              {privateApiKey ? (
                formatMaskedKey(privateApiKey)
              ) : (
                <span className="text-muted-foreground">
                  {ptBR.wixIntegration.keys.keyNotSet}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setEditingPrivate(true)}
            >
              {ptBR.wixIntegration.keys.editKey}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
