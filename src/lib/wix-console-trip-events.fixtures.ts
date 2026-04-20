import { z } from "zod";

import {
  type TripConsoleEventRow,
  type TripConsoleEventType,
  tripConsoleEventRowSchema,
} from "@/lib/wix-console-schemas";

function uuidFromIndex(i: number): string {
  const hex = i.toString(16).padStart(12, "0");
  return `20000000-0000-4000-8000-${hex.slice(0, 12)}`;
}

const CYCLE: TripConsoleEventType[] = ["create", "updated", "deleted"];

function buildRow(i: number): TripConsoleEventRow {
  const eventType = CYCLE[i % CYCLE.length];
  const tripName =
    eventType === "create" || eventType === "updated"
      ? `Viagem console ${((i % 6) + 1).toString().padStart(2, "0")}`
      : null;
  const baseDate = new Date(
    Date.UTC(2026, 1, 12 + (i % 20), 14 + (i % 5), (i * 11) % 60, 0),
  );
  return tripConsoleEventRowSchema.parse({
    id: uuidFromIndex(i + 1),
    eventType,
    tripName,
    date: baseDate.toISOString(),
  });
}

const raw = Array.from({ length: 29 }, (_, i) => buildRow(i));

export const MOCK_WIX_TRIP_CONSOLE_ROWS: TripConsoleEventRow[] = z
  .array(tripConsoleEventRowSchema)
  .parse(raw);
