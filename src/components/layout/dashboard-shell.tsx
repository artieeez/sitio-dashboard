import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Moon, Route, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardBreadcrumbs } from "@/components/layout/dashboard-breadcrumbs";
import {
  SchoolScopeHeader,
  SchoolScopeSummary,
} from "@/components/layout/school-scope-header";
import { SchoolScopeMenu } from "@/components/layout/school-scope-menu";
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
import { useSchoolsForScope } from "@/hooks/use-schools-for-scope";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { schoolSchema } from "@/lib/schemas/school";
import { getRecentSchools, touchRecentSchool } from "@/lib/scope-persistence";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";
import { useThemeStore } from "@/stores/theme-store";

/**
 * US5 shell: shadcn sidebar + scrollable main (UI-FR-001), route-aware breadcrumbs.
 * School-scoped nav per specs/002-sidebar-school-scope: Home + Trips (trip list hub per 001).
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
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

  return (
    <SidebarProvider className="flex h-[100dvh] flex-col overflow-hidden">
      <Sidebar
        role="complementary"
        aria-label={ptBR.shell.sidebarNav}
        collapsible="icon"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SchoolScopeHeader
                school={activeSchoolQuery.data ?? null}
                onEditSchool={() => {
                  if (!activeSchoolId) return;
                  navigate({
                    to: "/schools/$schoolId",
                    params: { schoolId: activeSchoolId },
                  });
                }}
                menuTrigger={
                  <SchoolScopeMenu
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
                  >
                    <SidebarMenuButton
                      size="lg"
                      aria-label={ptBR.scope.openMenu}
                    >
                      <SchoolScopeSummary
                        school={activeSchoolQuery.data ?? null}
                      />
                    </SidebarMenuButton>
                  </SchoolScopeMenu>
                }
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
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                onClick={() => toggleTheme()}
                aria-label={ptBR.theme.toggle}
              >
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
                <span>
                  {theme === "dark" ? ptBR.theme.light : ptBR.theme.dark}
                </span>
              </SidebarMenuButton>
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
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 md:hidden"
            aria-label="Sítio"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary font-semibold text-primary-foreground text-sm">
              S
            </div>
            <span className="font-semibold">Sítio</span>
          </Link>
          <DashboardBreadcrumbs />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
