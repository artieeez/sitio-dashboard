import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ptBR } from "@/messages/pt-BR";

export type WixIntegrationKeyFieldsProps = {
  publicKey: string;
  privateApiKey: string;
  onPublicKeyChange: (value: string) => void;
  onPrivateApiKeyChange: (value: string) => void;
};

export function WixIntegrationKeyFields({
  publicKey,
  privateApiKey,
  onPublicKeyChange,
  onPrivateApiKeyChange,
}: WixIntegrationKeyFieldsProps) {
  const baseId = useId();
  const publicId = `${baseId}-public`;
  const privateId = `${baseId}-private`;
  const [privateVisible, setPrivateVisible] = useState(false);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid gap-2">
        <label htmlFor={publicId} className="font-medium text-sm">
          {ptBR.wixIntegration.keys.publicKey}
        </label>
        <Input
          id={publicId}
          name="wixPublicKey"
          autoComplete="off"
          value={publicKey}
          onChange={(e) => onPublicKeyChange(e.target.value)}
          placeholder={ptBR.wixIntegration.keys.publicKeyPlaceholder}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={privateId} className="font-medium text-sm">
            {ptBR.wixIntegration.keys.privateKey}
          </label>
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
        </div>
        <Input
          id={privateId}
          name="wixPrivateApiKey"
          autoComplete="off"
          type={privateVisible ? "text" : "password"}
          value={privateApiKey}
          onChange={(e) => onPrivateApiKeyChange(e.target.value)}
          placeholder={ptBR.wixIntegration.keys.privateKeyPlaceholder}
        />
      </div>
    </div>
  );
}
