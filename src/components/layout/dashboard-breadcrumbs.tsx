import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { apiJson } from "@/lib/api-client";
import { buildBreadcrumbTrail, extractPathIds } from "@/lib/breadcrumb-trail";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { tripSchema } from "@/lib/schemas/trip";
import { setScrollLeftToEnd } from "@/lib/scroll-overflow-end";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

const PLACEHOLDER = "\u2026";

export function DashboardBreadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    schoolId: pathSchoolId,
    tripId,
    passengerId,
  } = extractPathIds(pathname);

  const schoolIdVal = pathSchoolId && isUuid(pathSchoolId) ? pathSchoolId : "";
  const tripIdVal = tripId && isUuid(tripId) ? tripId : "";
  const passengerIdVal = passengerId && isUuid(passengerId) ? passengerId : "";

  const tripQuery = useQuery({
    queryKey: queryKeys.trip(tripIdVal || "skip"),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/trips/${tripIdVal}`);
      return tripSchema.parse(raw);
    },
    enabled: !!tripIdVal,
  });

  const schoolIdFromTrip = tripQuery.data?.schoolId;
  const schoolIdForQuery = schoolIdVal
    ? schoolIdVal
    : schoolIdFromTrip && isUuid(schoolIdFromTrip)
      ? schoolIdFromTrip
      : "";

  const passengerQuery = useQuery({
    queryKey: queryKeys.passenger(passengerIdVal || "skip"),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/passengers/${passengerIdVal}`);
      return passengerWithStatusSchema.parse(raw);
    },
    enabled: !!passengerIdVal,
  });

  const tripLabel =
    tripQuery.data?.title?.trim() ||
    (tripIdVal ? PLACEHOLDER : ptBR.entities.trip);

  const passengerLabel =
    passengerQuery.data?.fullName?.trim() ||
    (passengerIdVal ? PLACEHOLDER : ptBR.entities.passenger);

  const items = buildBreadcrumbTrail({
    pathname,
    schoolIdFromPath: schoolIdVal,
    schoolIdForLinks: schoolIdForQuery,
    tripId: tripIdVal,
    passengerId: passengerIdVal,
    tripLabel,
    passengerLabel,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const trailKey = [
    pathname,
    schoolIdVal,
    schoolIdForQuery,
    tripIdVal,
    passengerIdVal,
    tripLabel,
    passengerLabel,
  ].join("\0");

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scroll when trail content changes (trailKey)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollLeftToEnd(el);
  }, [trailKey]);

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <div
        ref={scrollRef}
        data-testid="breadcrumb-scroll"
        className="min-w-0 flex-1 overflow-x-auto"
      >
        <BreadcrumbList className="flex-nowrap">
          {items.map((crumb, i) => {
            const isLast = i === items.length - 1;
            const hasLink = "to" in crumb && crumb.to;
            return (
              <span key={crumb.key} className="contents">
                {i > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem className="shrink-0">
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : hasLink ? (
                    <BreadcrumbLink
                      render={
                        <Link
                          to={crumb.to}
                          {...(crumb.params ? { params: crumb.params } : {})}
                        />
                      }
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground">{crumb.label}</span>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </div>
    </Breadcrumb>
  );
}
