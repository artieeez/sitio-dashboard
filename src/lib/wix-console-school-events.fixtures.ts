import { z } from "zod";

import {
  type SchoolConsoleEventRow,
  type SchoolConsoleEventType,
  schoolConsoleEventRowSchema,
} from "@/lib/wix-console-schemas";

function uuidFromIndex(i: number): string {
  const hex = i.toString(16).padStart(12, "0");
  return `10000000-0000-4000-8000-${hex.slice(0, 12)}`;
}

const CYCLE: SchoolConsoleEventType[] = [
  "create",
  "updated",
  "deleted",
  "removedTrip",
  "addedTrip",
];

function buildRow(i: number): SchoolConsoleEventRow {
  const eventType = CYCLE[i % CYCLE.length];
  const categoryName =
    eventType === "create" || eventType === "updated"
      ? `Categoria ${((i % 4) + 1).toString().padStart(2, "0")}`
      : null;
  const baseDate = new Date(
    Date.UTC(2026, 2, 5 + (i % 25), 10 + (i % 8), (i * 7) % 60, 0),
  );
  return schoolConsoleEventRowSchema.parse({
    id: uuidFromIndex(i + 1),
    eventType,
    categoryName,
    date: baseDate.toISOString(),
  });
}

const raw = Array.from({ length: 37 }, (_, i) => buildRow(i));

export const MOCK_WIX_SCHOOL_CONSOLE_ROWS: SchoolConsoleEventRow[] = z
  .array(schoolConsoleEventRowSchema)
  .parse(raw);
