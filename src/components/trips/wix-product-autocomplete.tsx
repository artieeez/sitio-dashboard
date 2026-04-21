import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Autocomplete } from "@/components/ui/autocomplete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiJson } from "@/lib/api-client";
import {
  type WixProductSummary,
  wixProductAutocompleteResponseSchema,
} from "@/lib/schemas/wix-product";
import { ptBR } from "@/messages/pt-BR";

const DEBOUNCE_MS = 320;

export function WixProductAutocomplete(props: {
  schoolId: string;
  valueId: string | null;
  valueName: string | null;
  disabled?: boolean;
  onSelect: (summary: WixProductSummary) => void;
  onClear: () => void;
}) {
  const { schoolId, valueId, valueName, disabled, onSelect, onClear } = props;
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const debounceMs = search.trim() ? DEBOUNCE_MS : 0;
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const acQuery = useQuery({
    queryKey: ["wix-product-autocomplete", schoolId, debouncedSearch],
    queryFn: async () => {
      const raw = await apiJson<unknown>(
        `/integrations/wix/products/autocomplete?schoolId=${encodeURIComponent(schoolId)}&prefix=${encodeURIComponent(debouncedSearch)}`,
      );
      return wixProductAutocompleteResponseSchema.parse(raw);
    },
    enabled: !disabled && open,
  });

  const items = acQuery.data?.products ?? [];
  const showDropdown = open;

  const selected =
    valueId && (valueName || valueId)
      ? { id: valueId, display: valueName ?? valueId }
      : null;

  return (
    <Autocomplete<WixProductSummary>
      label={ptBR.fields.wixProduct}
      placeholder={ptBR.fields.wixProductSearchPlaceholder}
      disabled={disabled}
      selected={selected}
      onClear={() => {
        onClear();
        setOpen(false);
      }}
      onSelect={(p) => {
        onSelect(p);
        setOpen(false);
      }}
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        setOpen(true);
      }}
      onFocus={() => setOpen(true)}
      showDropdown={showDropdown}
      items={items}
      isLoading={acQuery.isPending}
      isError={acQuery.isError}
      errorMessage="Erro ao buscar produtos."
      emptyMessage="Nenhum produto encontrado."
      getOptionKey={(p) => p.id}
      renderOption={(p) => <span className="font-medium">{p.name}</span>}
      clearButtonLabel={ptBR.fields.wixProductClear}
    />
  );
}
