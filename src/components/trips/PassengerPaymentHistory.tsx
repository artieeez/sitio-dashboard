import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";
import { ListPanePageHeader } from "@/components/layout/list-pane-layout";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import type { SortableListTableSortState } from "@/components/ui/sortable-list-table";
import { SortableListTable } from "@/components/ui/sortable-list-table";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { type Payment, paymentSchema } from "@/lib/schemas/payment";
import { tableStickyActionUnselected } from "@/lib/table-sticky-action-surface";
import { paymentEditLink, paymentsNewLink } from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

function brlMinor(minor: number): string {
  return (minor / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type PaymentTableSortColumn =
  | "paidOn"
  | "amount"
  | "location"
  | "payerIdentity"
  | "actions";

function noopSort(_column: PaymentTableSortColumn) {
  return;
}

export function PassengerPaymentHistory(props: {
  tripId: string;
  passengerId: string;
  /** When set, new payments are blocked server-side; show context copy. */
  removedAt?: string | null;
  /** When under the school trips shell, links stay on `/schools/.../trips/...`. */
  schoolId?: string;
}) {
  const { tripId, passengerId, removedAt, schoolId } = props;
  const pay = { tripId, passengerId, schoolId };
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: queryKeys.payments(passengerId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/passengers/${passengerId}/payments`);
      return z.array(paymentSchema).parse(raw);
    },
  });

  const remove = useMutation({
    mutationFn: async (paymentId: string) => {
      await apiDelete(`/payments/${paymentId}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.payments(passengerId),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, false),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, true),
      });
      await qc.invalidateQueries({
        queryKey: ["passengerAggregates", tripId],
      });
    },
  });

  const sortState = useMemo<SortableListTableSortState<PaymentTableSortColumn>>(
    () => ({ column: "paidOn", direction: "asc" }),
    [],
  );

  const rows = list.data ?? [];

  const columns = useMemo(
    () => [
      {
        id: "paidOn" as const,
        header: ptBR.fields.paidOn,
        sortable: false,
        tdClassName: "tabular-nums whitespace-nowrap",
        render: (p: Payment) => p.paidOn,
      },
      {
        id: "amount" as const,
        header: ptBR.fields.amount,
        sortable: false,
        tdClassName: "tabular-nums whitespace-nowrap",
        render: (p: Payment) => brlMinor(p.amountMinor),
      },
      {
        id: "location" as const,
        header: ptBR.fields.location,
        sortable: false,
        tdClassName: "align-middle",
        render: (p: Payment) => p.location,
      },
      {
        id: "payerIdentity" as const,
        header: ptBR.fields.payerIdentity,
        sortable: false,
        tdClassName: "align-middle",
        render: (p: Payment) => p.payerIdentity,
      },
      {
        id: "actions" as const,
        header: <span className="sr-only">{ptBR.aria.rowMenu}</span>,
        sortable: false,
        thClassName:
          "sticky right-0 top-0 z-[3] w-11 min-w-11 bg-background text-right font-medium",
        tdClassName:
          "sticky right-0 z-[2] w-11 min-w-11 !p-0 whitespace-nowrap align-middle",
        render: (p: Payment) => (
          <div className="flex h-full justify-end px-2 py-1.5">
            <div
              className={cn(
                tableStickyActionUnselected,
                "pointer-events-auto rounded-sm py-0.5",
              )}
            >
              <RowKebabMenu
                ariaLabel={ptBR.aria.rowMenu}
                iconOrientation="horizontal"
              >
                <Link
                  role="menuitem"
                  {...paymentEditLink({
                    tripId,
                    passengerId,
                    schoolId,
                    paymentId: p.id,
                  })}
                  className="block rounded px-2 py-1.5 text-left text-sm no-underline hover:bg-muted"
                >
                  {ptBR.actions.edit}
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted disabled:opacity-50"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (
                      globalThis.confirm("Excluir este pagamento?") !== true
                    ) {
                      return;
                    }
                    remove.mutate(p.id);
                  }}
                >
                  {ptBR.actions.delete}
                </button>
              </RowKebabMenu>
            </div>
          </div>
        ),
      },
    ],
    [tripId, passengerId, schoolId, remove.isPending, remove.mutate],
  );

  return (
    <div
      className={`flex flex-col gap-4 ${removedAt ? "rounded-lg border border-amber-600/50 bg-amber-50/40 p-3 dark:border-amber-500/40 dark:bg-amber-950/30" : ""}`}
    >
      <ListPanePageHeader
        variant="compact"
        title={ptBR.entities.payments}
        menu={
          !removedAt ? (
            <Link
              {...paymentsNewLink(pay)}
              aria-label={ptBR.actions.newPayment}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit no-underline",
              )}
            >
              <Plus className="size-4 shrink-0" aria-hidden />
              {ptBR.actions.newPayment}
            </Link>
          ) : undefined
        }
      />
      {removedAt ? (
        <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
          {ptBR.fields.removedPassenger}: histórico somente leitura; novos
          pagamentos não são permitidos.
        </p>
      ) : null}
      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : list.isError ? (
        <p className="text-sm text-red-600" role="alert">
          Não foi possível carregar os pagamentos.
        </p>
      ) : (
        <SortableListTable<Payment, PaymentTableSortColumn>
          sort={sortState}
          onSortToggle={noopSort}
          rows={rows}
          getRowKey={(p) => p.id}
          emptyMessage={ptBR.emptyStates.payments}
          minWidthClassName="min-w-[560px]"
          columns={columns}
        />
      )}
    </div>
  );
}
