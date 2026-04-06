import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { schoolSchema } from "@/lib/schemas/school";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/schools/")({
  component: SchoolsPage,
});

function SchoolsPage() {
  const qc = useQueryClient();
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
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-medium">{ptBR.entities.schools}</h1>
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
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <div className="min-w-0">
                <Link
                  to="/schools/$schoolId"
                  params={{ schoolId: s.id }}
                  className="font-medium text-primary hover:underline"
                >
                  {s.title?.trim() ||
                    `${ptBR.entities.school} ${s.id.slice(0, 8)}…`}
                </Link>
                {!s.active ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({ptBR.fields.inactive})
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    {ptBR.actions.openLanding}
                  </a>
                ) : null}
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  onClick={async () => {
                    await apiDelete(`/schools/${s.id}`);
                    await qc.invalidateQueries({
                      queryKey: queryKeys.schools(includeInactive),
                    });
                  }}
                >
                  {ptBR.actions.delete}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">
          {ptBR.actions.create} {ptBR.entities.school}
        </h2>
        <SchoolForm
          mode="create"
          onSuccess={async () => {
            await qc.invalidateQueries({
              queryKey: queryKeys.schools(includeInactive),
            });
          }}
        />
      </section>
    </div>
  );
}
