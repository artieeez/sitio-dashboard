import { useBlocker } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { UnsavedChangesDialog } from "@/components/layout/unsaved-changes-dialog";

/**
 * TanStack Router `useBlocker` + same `UnsavedChangesDialog` as list–detail
 * local navigation (see `use-unsaved-changes-guard.ts` header).
 */
export function NavigationUnsavedGuard(props: {
  isDirty: boolean;
  onDiscard: () => void;
}) {
  const { isDirty, onDiscard } = props;
  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const blocker = useBlocker({
    shouldBlockFn: () => isDirtyRef.current,
    withResolver: true,
  });

  return blocker.status === "blocked" ? (
    <UnsavedChangesDialog
      open
      onContinueEditing={() => blocker.reset?.()}
      onDiscard={() => {
        onDiscard();
        blocker.proceed?.();
      }}
    />
  ) : null;
}
