import { useRef } from "react";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import {
  passengerPaymentStatusLabel,
  passengerPaymentStatusToneClass,
} from "@/lib/passenger-payment-status";
import type { PassengerWithStatus } from "@/lib/schemas/passenger";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

export function PassengerTable(props: {
  rows: PassengerWithStatus[];
  includeRemoved: boolean;
  onIncludeRemovedChange: (value: boolean) => void;
  /** When set, highlights the row for the passenger payments context (M3 list pane). */
  selectedPassengerId?: string | null;
  /** When set, row click and arrow keys move the detail pane (same pattern as school trips list). */
  onPassengerRowNavigate?: (passengerId: string) => void;
}) {
  const {
    rows,
    includeRemoved,
    onIncludeRemovedChange,
    selectedPassengerId = null,
    onPassengerRowNavigate,
  } = props;
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const rowNav = onPassengerRowNavigate;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <BooleanFilterChip
          checked={includeRemoved}
          onCheckedChange={onIncludeRemovedChange}
        >
          {ptBR.toggles.includeRemovedPassengers}
        </BooleanFilterChip>
      </div>
      <div className="overflow-x-auto rounded-md">
        <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1.5 font-medium whitespace-normal">
                {ptBR.fields.name}
              </th>
              <th className="px-2 py-1.5 font-medium whitespace-normal">
                {ptBR.fields.cpf}
              </th>
              <th className="px-2 py-1.5 font-medium whitespace-normal">
                {ptBR.fields.paymentStatus}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="border-b border-border px-2 py-3 text-muted-foreground whitespace-nowrap"
                >
                  {ptBR.entities.passengers} — nenhum registro.
                </td>
              </tr>
            ) : (
              rows.map((p, rowIndex) => (
                <tr
                  key={p.id}
                  ref={(el) => {
                    rowRefs.current[rowIndex] = el;
                  }}
                  tabIndex={rowNav ? 0 : undefined}
                  className={cn(
                    "group border-b border-border/80",
                    selectedPassengerId === p.id
                      ? "bg-muted/50 hover:bg-muted/55"
                      : "hover:bg-muted/40",
                    rowNav && "cursor-pointer outline-none",
                  )}
                  aria-selected={
                    selectedPassengerId === p.id ? true : undefined
                  }
                  aria-label={rowNav ? p.fullName : undefined}
                  onClick={rowNav ? () => rowNav(p.id) : undefined}
                  onKeyDown={
                    rowNav
                      ? (ev) => {
                          const idx = rows.findIndex((r) => r.id === p.id);
                          if (idx < 0) return;
                          if (ev.key === "ArrowDown") {
                            ev.preventDefault();
                            const next = Math.min(idx + 1, rows.length - 1);
                            rowRefs.current[next]?.focus();
                            rowNav(rows[next].id);
                          } else if (ev.key === "ArrowUp") {
                            ev.preventDefault();
                            const prev = Math.max(idx - 1, 0);
                            rowRefs.current[prev]?.focus();
                            rowNav(rows[prev].id);
                          } else if (ev.key === "Home") {
                            ev.preventDefault();
                            rowRefs.current[0]?.focus();
                            rowNav(rows[0].id);
                          } else if (ev.key === "End") {
                            ev.preventDefault();
                            const last = rows.length - 1;
                            rowRefs.current[last]?.focus();
                            rowNav(rows[last].id);
                          } else if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            rowNav(p.id);
                          }
                        }
                      : undefined
                  }
                >
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    {p.fullName}
                    {p.removedAt ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({ptBR.fields.removedPassenger})
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-1.5 tabular-nums whitespace-nowrap">
                    {p.cpf ?? "—"}
                  </td>
                  <td
                    className={`px-2 py-1.5 whitespace-nowrap ${passengerPaymentStatusToneClass(p.status)}`}
                  >
                    {passengerPaymentStatusLabel(p.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
