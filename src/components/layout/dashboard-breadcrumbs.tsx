import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { schoolSchema } from "@/lib/schemas/school";
import { tripSchema } from "@/lib/schemas/trip";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

type Crumb =
  | { key: string; label: string }
  | {
      key: string;
      label: string;
      to: string;
      params?: Record<string, string>;
    };

function extractIds(pathname: string) {
  const schoolMatch = pathname.match(/^\/schools\/([^/]+)/);
  const tripMatch = pathname.match(/^\/trips\/([^/]+)/);
  const passengerMatch = pathname.match(/\/passengers\/([^/]+)/);
  return {
    schoolId: schoolMatch?.[1],
    tripId: tripMatch?.[1],
    passengerId: passengerMatch?.[1],
  };
}

export function DashboardBreadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { schoolId: pathSchoolId, tripId, passengerId } = extractIds(pathname);

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

  const schoolQuery = useQuery({
    queryKey: queryKeys.school(schoolIdForQuery),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/schools/${schoolIdForQuery}`);
      return schoolSchema.parse(raw);
    },
    enabled: !!schoolIdForQuery && isUuid(schoolIdForQuery),
  });

  const passengerQuery = useQuery({
    queryKey: queryKeys.passenger(passengerIdVal || "skip"),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/passengers/${passengerIdVal}`);
      return passengerWithStatusSchema.parse(raw);
    },
    enabled: !!passengerIdVal,
  });

  const schoolLabel =
    schoolQuery.data?.title?.trim() ||
    (schoolIdForQuery
      ? `${ptBR.entities.school} ${schoolIdForQuery.slice(0, 8)}…`
      : ptBR.entities.school);

  const tripLabel =
    tripQuery.data?.title?.trim() ||
    (tripIdVal
      ? `${ptBR.entities.trip} ${tripIdVal.slice(0, 8)}…`
      : ptBR.entities.trip);

  const passengerLabel =
    passengerQuery.data?.fullName?.trim() ||
    (passengerIdVal
      ? `${ptBR.entities.passenger} ${passengerIdVal.slice(0, 8)}…`
      : ptBR.entities.passenger);

  const items: Crumb[] = [];

  if (pathname === "/") {
    items.push({ key: "home", label: ptBR.nav.home });
  } else {
    items.push({ key: "home", label: ptBR.nav.home, to: "/" });
  }

  if (pathname.startsWith("/schools")) {
    if (pathname === "/schools" || pathname === "/schools/") {
      items.push({ key: "schools", label: ptBR.entities.schools });
    } else if (pathname === "/schools/new") {
      items.push({
        key: "schools",
        label: ptBR.entities.schools,
        to: "/schools",
      });
      items.push({
        key: "new-school",
        label: `${ptBR.actions.create} ${ptBR.entities.school}`,
      });
    } else if (schoolIdVal) {
      items.push({
        key: "schools",
        label: ptBR.entities.schools,
        to: "/schools",
      });
      if (pathname.includes("/trips")) {
        items.push({
          key: "school",
          label: schoolLabel,
          to: "/schools/$schoolId",
          params: { schoolId: schoolIdVal },
        });
        if (pathname.endsWith("/trips/new")) {
          items.push({
            key: "trips",
            label: ptBR.entities.trips,
            to: "/schools/$schoolId/trips",
            params: { schoolId: schoolIdVal },
          });
          items.push({
            key: "new-trip",
            label: `${ptBR.actions.create} ${ptBR.entities.trip}`,
          });
        } else {
          items.push({ key: "trips", label: ptBR.entities.trips });
        }
      } else {
        items.push({ key: "school", label: schoolLabel });
      }
    }
  } else if (pathname.startsWith("/trips/") && tripIdVal) {
    const sid = schoolIdForQuery;
    if (!sid) {
      items.push({
        key: "schools",
        label: ptBR.entities.schools,
        to: "/schools",
      });
      items.push({ key: "trip", label: tripLabel });
    } else {
      items.push({
        key: "schools",
        label: ptBR.entities.schools,
        to: "/schools",
      });
      items.push({
        key: "school",
        label: schoolLabel,
        to: "/schools/$schoolId",
        params: { schoolId: sid },
      });
      items.push({
        key: "trips",
        label: ptBR.entities.trips,
        to: "/schools/$schoolId/trips",
        params: { schoolId: sid },
      });

      const tripOnly = /^\/trips\/[^/]+\/?$/.test(pathname);
      if (tripOnly) {
        items.push({ key: "trip", label: tripLabel });
      } else {
        items.push({
          key: "trip",
          label: tripLabel,
          to: "/trips/$tripId",
          params: { tripId: tripIdVal },
        });

        const passengersList =
          pathname.endsWith("/passengers") || pathname.endsWith("/passengers/");

        if (passengersList) {
          items.push({ key: "passengers", label: ptBR.entities.passengers });
        } else if (pathname.endsWith("/passengers/new")) {
          items.push({
            key: "passengers",
            label: ptBR.entities.passengers,
            to: "/trips/$tripId/passengers",
            params: { tripId: tripIdVal },
          });
          items.push({
            key: "new-passenger",
            label: `${ptBR.actions.create} ${ptBR.entities.passenger}`,
          });
        } else if (passengerIdVal && pathname.includes("/payments")) {
          items.push({
            key: "passengers",
            label: ptBR.entities.passengers,
            to: "/trips/$tripId/passengers",
            params: { tripId: tripIdVal },
          });
          items.push({
            key: "passenger",
            label: passengerLabel,
            to: "/trips/$tripId/passengers/$passengerId/payments",
            params: { tripId: tripIdVal, passengerId: passengerIdVal },
          });
          if (pathname.endsWith("/payments/new")) {
            items.push({
              key: "payments",
              label: ptBR.entities.payments,
              to: "/trips/$tripId/passengers/$passengerId/payments",
              params: { tripId: tripIdVal, passengerId: passengerIdVal },
            });
            items.push({
              key: "new-payment",
              label: ptBR.actions.newPayment,
            });
          } else if (pathname.includes("/edit")) {
            items.push({
              key: "payments",
              label: ptBR.entities.payments,
              to: "/trips/$tripId/passengers/$passengerId/payments",
              params: { tripId: tripIdVal, passengerId: passengerIdVal },
            });
            items.push({
              key: "edit-payment",
              label: ptBR.actions.editPayment,
            });
          } else {
            items.push({ key: "payments", label: ptBR.entities.payments });
          }
        }
      }
    }
  }

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap overflow-x-auto">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          const hasLink = "to" in crumb && crumb.to;
          return (
            <span key={crumb.key} className="contents">
              {i > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem className="shrink-0">
                {isLast || !hasLink ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
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
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
