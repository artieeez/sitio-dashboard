import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Route, School } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { SchoolScopeAvatar } from "@/components/layout/school-scope-header";
import { SchoolScopeMenu } from "@/components/layout/school-scope-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchoolsForScope } from "@/hooks/use-schools-for-scope";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { schoolSchema } from "@/lib/schemas/school";
import { schoolIdFromPathname } from "@/lib/school-scope-path";
import { getRecentSchools, touchRecentSchool } from "@/lib/scope-persistence";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

function mobileSchoolTitle(title: string | null | undefined) {
  return title?.trim() || ptBR.scope.noSchoolSelected;
}

/**
 * US5 shell: shadcn sidebar + scrollable main (UI-FR-001).
 * Main nav: Início, Viagens, Escolas (directory); scope menu above for switching school.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeSchoolId = schoolIdFromPathname(pathname);
  const onSchoolsDirectory = useMemo(
    () =>
      pathname === "/schools" ||
      pathname === "/schools/" ||
      pathname === "/schools/new",
    [pathname],
  );
  const schoolsQuery = useSchoolsForScope();
  const activeSchoolQuery = useQuery({
    queryKey: queryKeys.school(activeSchoolId || "skip"),
    enabled: !!activeSchoolId,
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/schools/${activeSchoolId}`);
      return schoolSchema.parse(raw);
    },
  });

  const activeSchool = activeSchoolQuery.data ?? null;

  return (
    <SidebarProvider className="flex h-[100dvh] min-h-0 w-full flex-row overflow-hidden">
      <Sidebar
        role="complementary"
        aria-label={ptBR.shell.sidebarNav}
        collapsible="icon"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="min-w-0">
              <SchoolScopeMenu
                school={activeSchool}
                schools={schoolsQuery.data ?? []}
                recents={getRecentSchools()}
                onSelectSchool={(schoolId) => {
                  touchRecentSchool(schoolId);
                  queryClient.invalidateQueries({
                    queryKey: queryKeys.school(schoolId),
                  });
                  navigate({
                    to: "/schools/$schoolId/trips",
                    params: { schoolId },
                  });
                }}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="min-h-0 flex-1">
            <SidebarGroup>
              <SidebarGroupLabel>{ptBR.shell.mainNavGroup}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {activeSchoolId ? (
                      <SidebarMenuButton
                        tooltip={ptBR.nav.home}
                        render={
                          <Link
                            to="/schools/$schoolId"
                            params={{ schoolId: activeSchoolId }}
                            aria-label={ptBR.nav.home}
                          />
                        }
                      >
                        <Home className="size-4" />
                        <span>{ptBR.nav.home}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        type="button"
                        disabled
                        tooltip={ptBR.scope.selectSchoolForSidebarNav}
                        aria-label={ptBR.nav.home}
                        title={ptBR.scope.selectSchoolForSidebarNav}
                      >
                        <Home className="size-4" />
                        <span>{ptBR.nav.home}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    {activeSchoolId ? (
                      <SidebarMenuButton
                        tooltip={ptBR.entities.trips}
                        render={
                          <Link
                            to="/schools/$schoolId/trips"
                            params={{ schoolId: activeSchoolId }}
                            aria-label={ptBR.entities.trips}
                          />
                        }
                      >
                        <Route className="size-4" />
                        <span>{ptBR.entities.trips}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        type="button"
                        disabled
                        tooltip={ptBR.scope.selectSchoolForSidebarNav}
                        aria-label={ptBR.entities.trips}
                        title={ptBR.scope.selectSchoolForSidebarNav}
                      >
                        <Route className="size-4" />
                        <span>{ptBR.entities.trips}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={ptBR.entities.schools}
                      render={
                        <Link
                          to="/schools"
                          aria-label={ptBR.entities.schools}
                          aria-current={onSchoolsDirectory ? "page" : undefined}
                        />
                      }
                    >
                      <School className="size-4" />
                      <span>{ptBR.entities.schools}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <ModeToggle />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden")}
      >
        <header className="flex h-14 shrink-0 items-center gap-2 px-3 md:hidden">
          <SidebarTrigger className="-ml-0.5" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {activeSchoolId ? (
              activeSchoolQuery.isLoading ? (
                <>
                  <Skeleton className="size-8 shrink-0 rounded-[4px]" />
                  <Skeleton className="h-4 max-w-[12rem] flex-1" />
                </>
              ) : (
                <>
                  <SchoolScopeAvatar school={activeSchool} />
                  <span
                    className="min-w-0 truncate font-medium text-sm"
                    title={mobileSchoolTitle(activeSchool?.title)}
                  >
                    {mobileSchoolTitle(activeSchool?.title)}
                  </span>
                </>
              )
            ) : (
              <Link
                to="/"
                className="flex min-w-0 items-center gap-2"
                aria-label="Sítio"
              >
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-sm bg-primary font-semibold text-primary-foreground text-sm">
                  S
                </div>
                <span className="font-semibold">Sítio</span>
              </Link>
            )}
          </div>
        </header>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
