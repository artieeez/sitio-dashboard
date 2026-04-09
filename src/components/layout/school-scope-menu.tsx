import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const suggestListId = "school-scope-search-suggestions";

export function SchoolScopeMenu(props: {
  school: School | null;
  schools: School[];
  recents: RecentSchoolEntry[];
  onSelectSchool: (schoolId: string) => void;
}) {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [query, setQuery] = useState("");
  const scopeRootRef = useRef<HTMLDivElement | null>(null);

  const recentSchools = useMemo(
    () => orderRecentSchools(props.schools, props.recents),
    [props.schools, props.recents],
  );
  const filtered = useMemo(
    () => filterSchoolsByTitle(props.schools, query),
    [props.schools, query],
  );

  const showSearchSuggestions = scopeOpen && query.trim().length > 0;

  useEffect(() => {
    if (state === "collapsed") {
      setScopeOpen(false);
    }
  }, [state]);

  useEffect(() => {
    if (!scopeOpen) {
      setQuery("");
    }
  }, [scopeOpen]);

  useEffect(() => {
    if (!scopeOpen) return;
    const onDocumentClick = (event: MouseEvent) => {
      const root = scopeRootRef.current;
      if (!root?.isConnected) return;
      const target = event.target;
      if (target instanceof Node && root.contains(target)) return;
      setScopeOpen(false);
    };
    // Bubble phase so the same `click` reaches sidebar links/buttons first; a
    // capture-phase `pointerdown` close was re-rendering before those clicks completed.
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [scopeOpen]);

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
    if (isMobile) {
      setOpenMobile(false);
    }
    props.onSelectSchool(schoolId);
  };

  return (
    <div ref={scopeRootRef} className="w-full min-w-0">
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
          closeMobileOnClick={false}
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
        <CollapsibleContent className="min-w-0 overflow-visible pt-2 pb-1">
          <div className="flex flex-col gap-3 px-0.5">
            <div className="relative z-20 min-w-0">
              <Input
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
                placeholder={ptBR.scope.searchPlaceholder}
                aria-label={ptBR.scope.searchPlaceholder}
                aria-expanded={showSearchSuggestions}
                aria-controls={
                  showSearchSuggestions ? suggestListId : undefined
                }
                aria-autocomplete="list"
                autoComplete="off"
                className="h-8 bg-background"
              />
              {showSearchSuggestions ? (
                <div
                  id={suggestListId}
                  role="listbox"
                  aria-label={ptBR.scope.searchResults}
                  className={cn(
                    "absolute top-full right-0 left-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10",
                  )}
                >
                  {filtered.length === 0 ? (
                    <p className="px-2 py-1.5 text-muted-foreground text-xs">
                      {ptBR.scope.noResults}
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-0.5">
                      {filtered.map((school) => (
                        <li key={`search-${school.id}`} role="presentation">
                          <button
                            type="button"
                            role="option"
                            className={cn(
                              listButtonClass,
                              "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                            onMouseDown={(ev) => {
                              ev.preventDefault();
                            }}
                            onClick={() => handleSelectSchool(school.id)}
                          >
                            {school.title?.trim() ||
                              `${ptBR.entities.school} ${school.id.slice(0, 8)}…`}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
            <section className="min-w-0">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
