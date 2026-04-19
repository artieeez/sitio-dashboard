import { createContext, type ReactNode, useContext, useEffect } from "react";

export type WorkspaceDirtySetter = (dirty: boolean) => void;

const WorkspaceDirtyContext = createContext<WorkspaceDirtySetter | null>(null);

export function WorkspaceDirtyProvider(props: {
  children: ReactNode;
  setWorkspaceDirty: WorkspaceDirtySetter;
}) {
  return (
    <WorkspaceDirtyContext.Provider value={props.setWorkspaceDirty}>
      {props.children}
    </WorkspaceDirtyContext.Provider>
  );
}

/**
 * When inside a `WorkspaceDirtyProvider`, reports aggregate dirty state for
 * router blockers and `ListDetailLayout` guards (004 M3).
 */
export function useReportWorkspaceDirty(isDirty: boolean): void {
  const set = useContext(WorkspaceDirtyContext);
  useEffect(() => {
    if (!set) return;
    set(isDirty);
    return () => set(false);
  }, [isDirty, set]);
}
