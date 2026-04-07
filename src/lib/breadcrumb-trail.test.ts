import { describe, expect, it } from "vitest";
import { buildBreadcrumbTrail } from "@/lib/breadcrumb-trail";
import { ptBR } from "@/messages/pt-BR";

const SCHOOL = "550e8400-e29b-41d4-a716-446655440000";
const TRIP = "660e8400-e29b-41d4-a716-446655440000";

const PLACEHOLDER = "\u2026";

describe("buildBreadcrumbTrail", () => {
  it("school-scoped home: first segment is Início (ptBR.nav.home), no Escolas", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/home`,
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

  it("school-scoped trips list: Início then Viagens; no Escolas in trail", () => {
    const trail = buildBreadcrumbTrail({
      pathname: `/schools/${SCHOOL}/trips`,
      schoolIdFromPath: SCHOOL,
      schoolIdForLinks: SCHOOL,
      tripId: "",
      passengerId: "",
      tripLabel: PLACEHOLDER,
      passengerLabel: PLACEHOLDER,
    });
    expect(trail.map((s) => s.label)).toEqual([
      ptBR.nav.home,
      ptBR.entities.trips,
    ]);
    expect(trail.map((s) => s.label)).not.toContain(ptBR.entities.schools);
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

  it("deep trip route: Início → Viagens → trip title; no Escolas", () => {
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
    expect(trail.map((s) => s.label)).toEqual([
      ptBR.nav.home,
      ptBR.entities.trips,
      tripTitle,
    ]);
    expect(trail.map((s) => s.label)).not.toContain(ptBR.entities.schools);
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
      ptBR.nav.home,
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
  it("parent segments include to/params; last segment has no link", () => {
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
    const parents = trail.slice(0, -1);
    for (const p of parents) {
      expect("to" in p && p.to).toBeTruthy();
    }
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
});
