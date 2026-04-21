import { type ReactNode, useId } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AutocompleteSelected = {
  id: string;
  /** Shown in the read-only chip when a value is chosen */
  display: string;
};

export type AutocompleteProps<T> = {
  label: ReactNode;
  placeholder: string;
  disabled?: boolean;
  selected: AutocompleteSelected | null;
  onClear: () => void;
  onSelect: (item: T) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onFocus?: () => void;
  /** When true, the listbox is rendered (loading / results / empty / error). */
  showDropdown: boolean;
  items: T[];
  isLoading?: boolean;
  isError?: boolean;
  loadingMessage?: ReactNode;
  errorMessage?: ReactNode;
  emptyMessage?: ReactNode;
  getOptionKey: (item: T) => string;
  renderOption: (item: T) => ReactNode;
  clearButtonLabel: string;
  className?: string;
  inputClassName?: string;
};

export function Autocomplete<T>(props: AutocompleteProps<T>) {
  const {
    label,
    placeholder,
    disabled,
    selected,
    onClear,
    onSelect,
    search,
    onSearchChange,
    onFocus,
    showDropdown,
    items,
    isLoading,
    isError,
    loadingMessage = "…",
    errorMessage = "Erro ao buscar.",
    emptyMessage = "Nenhum resultado.",
    getOptionKey,
    renderOption,
    clearButtonLabel,
    className,
    inputClassName,
  } = props;

  const listId = useId();
  const searchId = useId();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-1 text-sm">
        {selected ? (
          <>
            <span>{label}</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-input bg-muted/40 min-h-9 flex-1 rounded-md border px-3 py-2 font-medium">
                {selected.display}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  onClear();
                  onSearchChange("");
                }}
              >
                {clearButtonLabel}
              </Button>
            </div>
          </>
        ) : (
          <>
            <label htmlFor={searchId}>{label}</label>
            <input
              id={searchId}
              className={cn(
                "rounded border border-input bg-background px-2 py-1",
                inputClassName,
              )}
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              onFocus={() => onFocus?.()}
              placeholder={placeholder}
              disabled={disabled}
              aria-autocomplete="list"
              aria-controls={showDropdown ? listId : undefined}
            />
            {showDropdown ? (
              <div
                id={listId}
                role="listbox"
                className="border-input bg-popover z-10 max-h-60 overflow-auto rounded-md border shadow-md"
              >
                {isLoading ? (
                  <div className="text-muted-foreground px-3 py-2 text-sm">
                    {loadingMessage}
                  </div>
                ) : isError ? (
                  <div className="text-destructive px-3 py-2 text-sm">
                    {errorMessage}
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-muted-foreground px-3 py-2 text-sm">
                    {emptyMessage}
                  </div>
                ) : (
                  items.map((item) => (
                    <button
                      key={getOptionKey(item)}
                      type="button"
                      role="option"
                      className="hover:bg-muted/80 w-full px-3 py-2 text-left text-sm"
                      onClick={() => {
                        onSelect(item);
                        onSearchChange("");
                      }}
                    >
                      {renderOption(item)}
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
