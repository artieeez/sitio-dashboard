import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import type { WixCollectionSummary } from "@/lib/schemas/wix-collection";
import { wixCollectionAutocompleteResponseSchema } from "@/lib/schemas/wix-collection";
import { ptBR } from "@/messages/pt-BR";

const DEBOUNCE_MS = 320;

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function WixCollectionAutocomplete(props: {
  valueId: string | null;
  valueName: string | null;
  disabled?: boolean;
  onSelect: (summary: WixCollectionSummary) => void;
  onClear: () => void;
}) {
  const { valueId, valueName, disabled, onSelect, onClear } = props;
  const listId = useId();
  const searchId = useId();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_MS);

  const acQuery = useQuery({
    queryKey: ["wix-collection-autocomplete", debouncedSearch],
    queryFn: async () => {
      const raw = await apiJson<unknown>(
        `/integrations/wix/collections/autocomplete?prefix=${encodeURIComponent(debouncedSearch)}`,
      );
      return wixCollectionAutocompleteResponseSchema.parse(raw);
    },
    enabled: !disabled && debouncedSearch.trim().length >= 1 && open,
  });

  const items = acQuery.data?.collections ?? [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 text-sm">
        {valueId && (valueName || valueId) ? (
          <>
            <span>{ptBR.fields.wixCollection}</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-input bg-muted/40 min-h-9 flex-1 rounded-md border px-3 py-2 font-medium">
                {valueName ?? valueId}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  onClear();
                  setSearch("");
                  setOpen(false);
                }}
              >
                {ptBR.fields.wixCollectionClear}
              </Button>
            </div>
          </>
        ) : (
          <>
            <label htmlFor={searchId}>{ptBR.fields.wixCollection}</label>
            <input
              id={searchId}
              className="rounded border border-input bg-background px-2 py-1"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={ptBR.fields.wixCollectionSearchPlaceholder}
              disabled={disabled}
              aria-autocomplete="list"
              aria-controls={open ? listId : undefined}
            />
            {open && debouncedSearch.trim().length >= 1 ? (
              <div
                id={listId}
                role="listbox"
                className="border-input bg-popover z-10 max-h-60 overflow-auto rounded-md border shadow-md"
              >
                {acQuery.isPending ? (
                  <div className="text-muted-foreground px-3 py-2 text-sm">
                    …
                  </div>
                ) : acQuery.isError ? (
                  <div className="text-destructive px-3 py-2 text-sm">
                    Erro ao buscar coleções.
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-muted-foreground px-3 py-2 text-sm">
                    Nenhuma coleção encontrada.
                  </div>
                ) : (
                  items.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="option"
                      className="hover:bg-muted/80 w-full px-3 py-2 text-left text-sm"
                      onClick={() => {
                        onSelect(c);
                        setSearch("");
                        setOpen(false);
                      }}
                    >
                      <span className="font-medium">{c.name}</span>
                      {c.slug ? (
                        <span className="text-muted-foreground ml-2 font-mono text-xs">
                          {c.slug}
                        </span>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
