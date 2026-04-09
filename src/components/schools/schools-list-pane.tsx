import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { schoolSchema } from "@/lib/schemas/school";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

/**
 * Schools collection for the M3 list pane (004). Renders inside `ListDetailLayout` only.
 */
export function SchoolsListPane() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { selectedKey, requestSelect } = useListDetailLayout();
  const includeInactive = useUiPreferencesStore(
    (s) => s.includeInactiveSchools,
  );
  const setIncludeInactive = useUiPreferencesStore(
    (s) => s.setIncludeInactiveSchools,
  );

  const schoolsQuery = useQuery({
    queryKey: queryKeys.schools(includeInactive),
    queryFn: async () => {
      const q = includeInactive ? "?includeInactive=true" : "";
      const raw = await apiJson<unknown>(`/schools${q}`);
      return z.array(schoolSchema).parse(raw);
    },
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-medium">{ptBR.entities.schools}</h1>
          <Link
            to="/schools/new"
            aria-current={selectedKey === "__new__" ? true : undefined}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-fit",
              selectedKey === "__new__" && "ring-2 ring-ring ring-offset-2",
            )}
          >
            {ptBR.actions.create} {ptBR.entities.school}
          </Link>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(ev) => setIncludeInactive(ev.target.checked)}
          />
          {ptBR.toggles.includeInactiveSchools}
        </label>
      </header>

      {schoolsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : schoolsQuery.isError ? (
        <p className="text-sm text-red-600" role="alert">
          Não foi possível carregar as escolas.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
          {schoolsQuery.data?.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              {ptBR.emptyStates.schools}
            </li>
          ) : null}
          {schoolsQuery.data?.map((s) => (
            <li key={s.id}>
              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2",
                  selectedKey === s.id && "bg-muted/50",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 rounded-md text-left"
                  aria-current={selectedKey === s.id ? true : undefined}
                  onClick={() => requestSelect(s.id)}
                >
                  <span className="font-medium text-foreground">
                    {s.title?.trim() ||
                      `${ptBR.entities.school} ${s.id.slice(0, 8)}…`}
                  </span>
                  {!s.active ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({ptBR.fields.inactive})
                    </span>
                  ) : null}
                </button>
                <RowKebabMenu ariaLabel={ptBR.aria.rowMenu}>
                  <button
                    type="button"
                    role="menuitem"
                    className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                    onClick={() => requestSelect(s.id)}
                  >
                    {ptBR.actions.viewSchool}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      void navigate({
                        to: "/schools/$schoolId/trips",
                        params: { schoolId: s.id },
                      });
                    }}
                  >
                    {ptBR.actions.viewTrips}
                  </button>
                  {s.url ? (
                    <a
                      role="menuitem"
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "justify-start rounded px-2 py-1.5 font-normal",
                      )}
                    >
                      {ptBR.actions.openLanding}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    className="rounded px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
                    onClick={async () => {
                      await apiDelete(`/schools/${s.id}`);
                      await qc.invalidateQueries({
                        queryKey: queryKeys.schools(includeInactive),
                      });
                    }}
                  >
                    {ptBR.actions.delete}
                  </button>
                </RowKebabMenu>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
