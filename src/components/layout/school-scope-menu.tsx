import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SchoolScopeSummary } from "@/components/layout/school-scope-header";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import type { School } from "@/lib/schemas/school";
import type { RecentSchoolEntry } from "@/lib/schemas/scope";
import { filterSchoolsByTitle, orderRecentSchools } from "@/lib/scope-search";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

function schoolTooltip(title: string | null | undefined) {
  return title?.trim() || ptBR.scope.noSchoolSelected;
}

const listButtonClass =
  "w-full rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2";

export function SchoolScopeMenu(props: {
  school: School | null;
  schools: School[];
  recents: RecentSchoolEntry[];
  onSelectSchool: (schoolId: string) => void;
}) {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [query, setQuery] = useState("");

  const recentSchools = useMemo(
    () => orderRecentSchools(props.schools, props.recents),
    [props.schools, props.recents],
  );
  const filtered = useMemo(
    () => filterSchoolsByTitle(props.schools, query),
    [props.schools, query],
  );

  useEffect(() => {
    if (state === "collapsed") {
      setScopeOpen(false);
    }
  }, [state]);

  const handleHeaderClick = () => {
    if (isMobile) {
      setOpenMobile(true);
      setScopeOpen((v) => !v);
      return;
    }
    if (state === "collapsed") {
      setOpen(true);
      setScopeOpen(true);
      return;
    }
    setScopeOpen((v) => !v);
  };

  const handleSelectSchool = (schoolId: string) => {
    setScopeOpen(false);
    props.onSelectSchool(schoolId);
  };

  return (
    <Collapsible
      open={scopeOpen}
      onOpenChange={setScopeOpen}
      className="w-full min-w-0"
    >
      <SidebarMenuButton
        type="button"
        size="lg"
        tooltip={schoolTooltip(props.school?.title)}
        aria-label={ptBR.scope.openMenu}
        aria-expanded={scopeOpen}
        onClick={handleHeaderClick}
      >
        <SchoolScopeSummary school={props.school} />
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-sidebar-foreground/70 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
            scopeOpen && "rotate-180",
          )}
        />
      </SidebarMenuButton>
      <CollapsibleContent className="min-w-0 overflow-hidden pt-2 pb-1">
        <div className="flex flex-col gap-3 px-0.5">
          <Input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder={ptBR.scope.searchPlaceholder}
            aria-label={ptBR.scope.searchPlaceholder}
            autoComplete="off"
            className="h-8 bg-background"
          />
          <div
            className={cn(
              "max-h-[min(40vh,16rem)] space-y-3 overflow-y-auto pr-0.5",
            )}
          >

            <section>
              <p className="mb-1 px-1 font-medium text-sidebar-foreground/70 text-xs">
                {ptBR.scope.searchResults}
              </p>
              <ul className="flex flex-col gap-0.5">
                {filtered.length === 0 ? (
                  <li className="px-1 text-muted-foreground text-xs">
                    {ptBR.scope.noResults}
                  </li>
                ) : null}
                {filtered.map((school) => (
                  <li key={`search-${school.id}`}>
                    <button
                      type="button"
                      className={listButtonClass}
                      onClick={() => handleSelectSchool(school.id)}
                    >
                      {school.title?.trim() ||
                        `${ptBR.entities.school} ${school.id.slice(0, 8)}…`}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <p className="mb-1 px-1 font-medium text-sidebar-foreground/70 text-xs">
                {ptBR.scope.recents}
              </p>
              <ul className="flex flex-col gap-0.5">
                {recentSchools.length === 0 ? (
                  <li className="px-1 text-muted-foreground text-xs">
                    {ptBR.scope.noRecents}
                  </li>
                ) : null}
                {recentSchools.map((school) => (
                  <li key={school.id}>
                    <button
                      type="button"
                      className={listButtonClass}
                      onClick={() => handleSelectSchool(school.id)}
                    >
                      {school.title?.trim() ||
                        `${ptBR.entities.school} ${school.id.slice(0, 8)}…`}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
