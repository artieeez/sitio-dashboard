import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Autocomplete } from "@/components/ui/autocomplete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiJson } from "@/lib/api-client";
import type { WixCollectionSummary } from "@/lib/schemas/wix-collection";
import { wixCollectionAutocompleteResponseSchema } from "@/lib/schemas/wix-collection";
import { ptBR } from "@/messages/pt-BR";

const DEBOUNCE_MS = 320;

export function WixCollectionAutocomplete(props: {
  valueId: string | null;
  valueName: string | null;
  disabled?: boolean;
  onSelect: (summary: WixCollectionSummary) => void;
  onClear: () => void;
}) {
  const { valueId, valueName, disabled, onSelect, onClear } = props;
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
  const showDropdown = open && debouncedSearch.trim().length >= 1;

  const selected =
    valueId && (valueName || valueId)
      ? { id: valueId, display: valueName ?? valueId }
      : null;

  return (
    <Autocomplete<WixCollectionSummary>
      label={ptBR.fields.wixCollection}
      placeholder={ptBR.fields.wixCollectionSearchPlaceholder}
      disabled={disabled}
      selected={selected}
      onClear={() => {
        onClear();
        setOpen(false);
      }}
      onSelect={(c) => {
        onSelect(c);
        setOpen(false);
      }}
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        // Keep panel closed after pick (generic clears search) or when query is empty.
        setOpen(v.trim().length >= 1);
      }}
      onFocus={() => setOpen(true)}
      showDropdown={showDropdown}
      items={items}
      isLoading={acQuery.isPending}
      isError={acQuery.isError}
      errorMessage="Erro ao buscar coleções."
      emptyMessage="Nenhuma coleção encontrada."
      getOptionKey={(c) => c.id}
      renderOption={(c) => (
        <>
          <span className="font-medium">{c.name}</span>
          {c.slug ? (
            <span className="text-muted-foreground ml-2 font-mono text-xs">
              {c.slug}
            </span>
          ) : null}
        </>
      )}
      clearButtonLabel={ptBR.fields.wixCollectionClear}
    />
  );
}
