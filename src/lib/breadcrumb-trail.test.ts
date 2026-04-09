import { describe, expect, it } from "vitest";
import { buildBreadcrumbTrail, extractPathIds } from "@/lib/breadcrumb-trail";
import { ptBR } from "@/messages/pt-BR";

const SCHOOL = "550e8400-e29b-41d4-a716-446655440000";
const TRIP = "660e8400-e29b-41d4-a716-446655440000";

const PLACEHOLDER = "\u2026";

describe("buildBreadcrumbTrail", () => {
  it("school-scoped home: first segment is Início (ptBR.nav.home), no Escolas", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    expect(trail[0]?.label).toBe(ptBR.nav.home);
    expect(trail.map((s) => s.label)).not.toContain(ptBR.entities.schools);
  });

  it("school-scoped edit: Início (link) → Editar escola ativa", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/edit`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.map((s) => s.label)).toEqual([
      ptBR.nav.home,
      ptBR.scope.editSchool,
    ]);
    expect(trail[0]).toMatchObject({
      to: "/schools/$schoolId",
      params: { schoolId: SCHOOL },
    });
  });

  it("school-scoped trips list: Viagens is the root segment (sidebar Trips); no Escolas", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/trips`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.map((s) => s.label)).toEqual([ptBR.entities.trips]);
    expect(trail.map((s) => s.label)).not.toContain(ptBR.entities.schools);
    expect(trail.map((s) => s.label)).not.toContain(ptBR.nav.home);
  });

  it("never emits school title as a segment (school name not in builder)", () => {
    const fakeSchoolTitle = "Escola Secundária Inventada";
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/trips`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.every((s) => s.label !== fakeSchoolTitle)).toBe(true);
  });

  it("deep trip route: Viagens is root, then trip title; no Escolas", () => {
    const tripTitle = "Excursão Museu";
    const trail = buildBreadcrumbTrail({
      pathname: `/trips/${TRIP}/`,
      schoolIdFromPath: "",
      schoolIdForLinks: SCHOOL,
      tripId: TRIP,
      passengerId: "",
      tripLabel: tripTitle,
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.map((s) => s.label)).toEqual([ptBR.entities.trips, tripTitle]);
    expect(trail.map((s) => s.label)).not.toContain(ptBR.entities.schools);
    expect(trail.map((s) => s.label)).not.toContain(ptBR.nav.home);
  });

  it("trip passengers: nested labels include Passageiros", () => {
    const tripTitle = "Excursão Museu";
    const trail = buildBreadcrumbTrail({
      pathname: `/trips/${TRIP}/passengers`,
      schoolIdFromPath: "",
      schoolIdForLinks: SCHOOL,
      tripId: TRIP,
      passengerId: "",
      tripLabel: tripTitle,
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.map((s) => s.label)).toEqual([
      ptBR.entities.trips,
      tripTitle,
      ptBR.entities.passengers,
    ]);
  });

  it("minimal trail for /schools and /schools/new per research §7", () => {
    const list = buildBreadcrumbTrail({
      pathname: "/schools",
      schoolIdFromPath: "",
      schoolIdForLinks: "",
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    expect(list.map((s) => s.label)).toEqual([ptBR.entities.schools]);

    const neu = buildBreadcrumbTrail({
      pathname: "/schools/new",
      schoolIdFromPath: "",
      schoolIdForLinks: "",
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    expect(neu.map((s) => s.label)).toEqual([
      ptBR.entities.schools,
      `${ptBR.actions.create} ${ptBR.entities.school}`,
    ]);
  });
});

describe("buildBreadcrumbTrail navigation (US2)", () => {
  it("parent segments with links include to/params; last segment has no link", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/trips/${TRIP}/passengers`,
      schoolIdFromPath: "",
      schoolIdForLinks: SCHOOL,
      tripId: TRIP,
      passengerId: "",
      tripLabel: "Viagem X",
      passengerLabel: PLACEHOLDER,
    });
    const last = trail[trail.length - 1];
    expect(last && !("to" in last && last.to)).toBe(true);
    expect(trail[0]).toMatchObject({
      label: ptBR.entities.trips,
      to: "/schools/$schoolId/trips",
      params: { schoolId: SCHOOL },
    });
    const tripSeg = trail[1];
    expect(tripSeg).toMatchObject({
      label: "Viagem X",
      to: "/trips/$tripId/summary",
      params: { tripId: TRIP },
    });
  });

  it("school trips: last segment is current (no to)", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/trips`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    const last = trail[trail.length - 1];
    expect(last && !("to" in last && last.to)).toBe(true);
  });

  it("school trips detail pane: Viagens (link) → trip title (current)", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/trips/${TRIP}`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: TRIP,
      passengerId: "",
      tripLabel: "Viagem escola",
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.map((s) => s.label)).toEqual([
      ptBR.entities.trips,
      "Viagem escola",
    ]);
    expect(trail[0]).toMatchObject({
      to: "/schools/$schoolId/trips",
      params: { schoolId: SCHOOL },
    });
    const last = trail[trail.length - 1];
    expect(last && !("to" in last && last.to)).toBe(true);
  });

  it("extractPathIds reads tripId from school-scoped trips URL, not from .../new", () => {
    expect(extractPathIds(`/schools/${SCHOOL}/trips/${TRIP}`)).toMatchObject({
      schoolId: SCHOOL,
      tripId: TRIP,
    });
    expect(
      extractPathIds(`/schools/${SCHOOL}/trips/new`).tripId,
    ).toBeUndefined();
  });

  it("school-scoped passengers list: Viagens → trip (link) → Passageiros (current)", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/trips/${TRIP}/passengers`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: TRIP,
      passengerId: "",
      tripLabel: "Viagem P",
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.map((s) => s.label)).toEqual([
      ptBR.entities.trips,
      "Viagem P",
      ptBR.entities.passengers,
    ]);
    const last = trail[trail.length - 1];
    expect(last && !("to" in last && last.to)).toBe(true);
  });
});
