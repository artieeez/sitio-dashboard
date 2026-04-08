import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Pencil, Plus, Route } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardBreadcrumbs } from "@/components/layout/dashboard-breadcrumbs";
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
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchoolsForScope } from "@/hooks/use-schools-for-scope";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { schoolSchema } from "@/lib/schemas/school";
import { getRecentSchools, touchRecentSchool } from "@/lib/scope-persistence";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

function mobileSchoolTitle(title: string | null | undefined) {
  return title?.trim() || ptBR.scope.noSchoolSelected;
}

/**
 * US5 shell: shadcn sidebar + scrollable main (UI-FR-001), route-aware breadcrumbs.
 * School-scoped nav per specs/002-sidebar-school-scope: Home + Trips (trip list hub per 001).
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeSchoolId = pathname.match(/^\/schools\/([^/]+)/)?.[1] ?? "";
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
  const editCurrentSchool = () => {
    if (!activeSchoolId) return;
    navigate({
      to: "/schools/$schoolId",
      params: { schoolId: activeSchoolId },
    });
  };

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
                    to: "/schools/$schoolId",
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
                    <SidebarMenuButton
                      render={
                        <Link
                          to={activeSchoolId ? "/schools/$schoolId/home" : "/"}
                          params={
                            activeSchoolId
                              ? { schoolId: activeSchoolId }
                              : undefined
                          }
                          aria-label={ptBR.nav.home}
                        />
                      }
                    >
                      <Home className="size-4" />
                      <span>{ptBR.nav.home}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={
                        <Link
                          to={
                            activeSchoolId
                              ? "/schools/$schoolId/trips"
                              : "/schools"
                          }
                          params={
                            activeSchoolId
                              ? { schoolId: activeSchoolId }
                              : undefined
                          }
                          aria-label={ptBR.entities.trips}
                        />
                      }
                    >
                      <Route className="size-4" />
                      <span>{ptBR.entities.trips}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="mx-0" />
            <SidebarGroup>
              <SidebarGroupLabel>{ptBR.shell.schoolGroup}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {activeSchoolId ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        type="button"
                        onClick={editCurrentSchool}
                        aria-label={ptBR.scope.editSchool}
                      >
                        <Pencil className="size-4" />
                        <span>{ptBR.scope.editSchool}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={
                        <Link
                          to="/schools/new"
                          aria-label={ptBR.scope.addSchool}
                        />
                      }
                    >
                      <Plus className="size-4" />
                      <span>{ptBR.scope.addSchool}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator className="mx-0" />
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
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 md:px-4">
          <SidebarTrigger className="-ml-0.5" />
          <Separator
            orientation="vertical"
            className="mr-1 hidden h-4 md:block"
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
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
          <div className="hidden min-w-0 flex-1 md:block">
            <DashboardBreadcrumbs />
          </div>
        </header>
        <div className="shrink-0 border-b px-3 py-2 md:hidden">
          <DashboardBreadcrumbs />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
