/**
 * Unsaved-changes guard (004 M3): **application-layer** blocking for list selection
 * and compact **Close** (deselect) via `tryRun` + Alert Dialog (composed by `ListDetailLayoutPane`).
 *
 * **Router layer (research.md §4) — chosen API**: In route layouts under
 * `RouterProvider`, use TanStack Router `useBlocker` with `withResolver: true`, e.g.
 * `shouldBlockFn: () => isDirty`, then map `status === "blocked"` to the same
 * `UnsavedChangesDialog`: **Continue editing** → `reset()`, **Discard** →
 * `onDiscard()` then `proceed()`. Wire that in Phase 3 where each layout owns
 * `isDirty` (forms + URL navigation).
 *
 * This hook stays router-free so Vitest can run without `RouterProvider` and so
 * Vite does not need TanStack Start/Nitro plugins during `vitest` (see
 * `vite.config.ts`: those plugins are skipped when `process.env.VITEST` is set).
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type UnsavedChangesLocalPending = { run: () => void };

export function useUnsavedChangesGuard({
  isDirty,
  onDiscard,
}: {
  isDirty: boolean;
  onDiscard: () => void;
}) {
  const [localPending, setLocalPending] =
    useState<UnsavedChangesLocalPending | null>(null);
  const localPendingRef = useRef<UnsavedChangesLocalPending | null>(null);
  localPendingRef.current = localPending;

  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const dialogOpen = localPending !== null;

  const cancelDialog = useCallback(() => {
    setLocalPending(null);
  }, []);

  const confirmDiscard = useCallback(() => {
    onDiscard();
    const pending = localPendingRef.current;
    setLocalPending(null);
    pending?.run();
  }, [onDiscard]);

  const tryRun = useCallback((run: () => void) => {
    if (!isDirtyRef.current) {
      run();
      return;
    }
    setLocalPending({ run });
  }, []);

  return {
    dialogOpen,
    tryRun,
    confirmDiscard,
    cancelDialog,
  };
}
