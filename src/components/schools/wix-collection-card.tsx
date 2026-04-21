import type { WixCollectionSummary } from "@/lib/schemas/wix-collection";
import { ptBR } from "@/messages/pt-BR";

export function WixCollectionCard(props: { summary: WixCollectionSummary }) {
  const { summary } = props;
  return (
    <div className="bg-muted/40 border-input flex flex-col gap-3 overflow-hidden rounded-lg border p-4 text-sm">
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        {summary.imageUrl ? (
          <img
            src={summary.imageUrl}
            alt=""
            className="border-input size-20 shrink-0 rounded-md border object-cover"
          />
        ) : (
          <div className="border-input bg-muted size-20 shrink-0 rounded-md border" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium leading-tight">{summary.name}</p>
          {summary.slug ? (
            <p className="text-muted-foreground font-mono text-xs break-all">
              {ptBR.fields.slug}: {summary.slug}
            </p>
          ) : null}
          <p className="text-muted-foreground text-xs">
            {ptBR.fields.visibility}:{" "}
            {summary.visible === false
              ? ptBR.fields.hidden
              : ptBR.fields.visible}
          </p>
          {summary.numberOfProducts != null ? (
            <p className="text-muted-foreground text-xs">
              {ptBR.fields.products}: {summary.numberOfProducts}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
