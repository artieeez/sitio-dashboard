import { ArrowLeftIcon } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { UnsavedChangesDialog } from "@/components/layout/unsaved-changes-dialog";
import { Button } from "@/components/ui/button";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

export type ListDetailLayoutContextValue = {
  selectedKey: string | null | undefined;
  requestSelect: (key: string | null) => void;
  requestCompactBack: () => void;
  isCompact: boolean;
};

const ListDetailLayoutContext =
  createContext<ListDetailLayoutContextValue | null>(null);

export function useListDetailLayout(): ListDetailLayoutContextValue {
  const ctx = useContext(ListDetailLayoutContext);
  if (!ctx) {
    throw new Error(
      "useListDetailLayout must be used within ListDetailLayoutPane",
    );
  }
  return ctx;
}

export type ListDetailLayoutPaneProps = {
  list: ReactNode;
  detail: ReactNode;
  selectedKey?: string | null;
  onSelectedKeyChange?: (key: string | null) => void;
  isDirty?: boolean;
  onDiscardDirty?: () => void;
  isCompact: boolean;
};

/**
 * M3 list–detail shell: list + detail regions, compact stack + back, unsaved dialog.
 * Does not call `useIsMobile` — pass `isCompact` from the parent (or from tests).
 */
export function ListDetailLayoutPane({
  list,
  detail,
  selectedKey = null,
  onSelectedKeyChange,
  isDirty = false,
  onDiscardDirty = () => {},
  isCompact,
}: ListDetailLayoutPaneProps) {
  const [stackTop, setStackTop] = useState<"list" | "detail">("list");
  const lastSyncedSelectionRef = useRef<string | null | undefined>(undefined);
  const prevCompactRef = useRef<boolean | undefined>(undefined);

  const { dialogOpen, tryRun, confirmDiscard, cancelDialog } =
    useUnsavedChangesGuard({
      isDirty,
      onDiscard: onDiscardDirty,
    });

  useEffect(() => {
    const wasCompact = prevCompactRef.current;
    prevCompactRef.current = isCompact;

    if (!isCompact) {
      setStackTop("list");
      lastSyncedSelectionRef.current = selectedKey;
      return;
    }
    if (selectedKey == null) {
      setStackTop("list");
      lastSyncedSelectionRef.current = null;
      return;
    }
    if (wasCompact === false) {
      setStackTop("detail");
      lastSyncedSelectionRef.current = selectedKey;
      return;
    }
    if (lastSyncedSelectionRef.current !== selectedKey) {
      setStackTop("detail");
      lastSyncedSelectionRef.current = selectedKey;
    }
  }, [selectedKey, isCompact]);

  const requestSelect = useCallback(
    (key: string | null) => {
      tryRun(() => {
        onSelectedKeyChange?.(key);
        if (isCompact) {
          setStackTop(key != null ? "detail" : "list");
        }
      });
    },
    [tryRun, onSelectedKeyChange, isCompact],
  );

  const requestCompactBack = useCallback(() => {
    tryRun(() => setStackTop("list"));
  }, [tryRun]);

  const contextValue = useMemo<ListDetailLayoutContextValue>(
    () => ({
      selectedKey,
      requestSelect,
      requestCompactBack,
      isCompact,
    }),
    [selectedKey, requestSelect, requestCompactBack, isCompact],
  );

  const showList = !isCompact || stackTop === "list";
  const showDetail = !isCompact || stackTop === "detail";
  const listLabel = ptBR.listDetail.listRegion;
  const detailLabel = ptBR.listDetail.detailRegion;

  return (
    <div
      data-testid="list-detail-layout"
      className="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <ListDetailLayoutContext.Provider value={contextValue}>
        <div
          className={cn(
            "flex min-h-0 flex-1",
            isCompact ? "flex-col" : "flex-row",
          )}
        >
          {showList ? (
            <section
              aria-label={listLabel}
              data-testid="list-detail-list-pane"
              className={cn(
                "flex min-h-0 min-w-0 flex-col overflow-y-auto",
                !isCompact &&
                  "max-w-sm min-w-[18rem] flex-none border-border border-r",
              )}
            >
              {list}
            </section>
          ) : null}
          {showDetail ? (
            <section
              aria-label={detailLabel}
              data-testid="list-detail-detail-pane"
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
            >
              {isCompact && stackTop === "detail" ? (
                <div className="flex shrink-0 border-border border-b p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 px-2"
                    onClick={() => requestCompactBack()}
                    aria-label={ptBR.listDetail.compactBack}
                  >
                    <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
                    {ptBR.listDetail.compactBack}
                  </Button>
                </div>
              ) : null}
              {detail}
            </section>
          ) : null}
        </div>
      </ListDetailLayoutContext.Provider>
      <UnsavedChangesDialog
        open={dialogOpen}
        onContinueEditing={cancelDialog}
        onDiscard={confirmDiscard}
      />
    </div>
  );
}
