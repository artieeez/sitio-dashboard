import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { paymentSchema } from "@/lib/schemas/payment";
import { paymentEditLink, paymentsNewLink } from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

function brlMinor(minor: number): string {
  return (minor / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

  return (
    <div
      className={`flex flex-col gap-4 ${removedAt ? "rounded-lg border border-amber-600/50 bg-amber-50/40 p-3 dark:border-amber-500/40 dark:bg-amber-950/30" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{ptBR.entities.payments}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {!removedAt ? (
            <Link
              {...paymentsNewLink(pay)}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "no-underline",
              )}
            >
              {ptBR.actions.newPayment}
            </Link>
          ) : null}
        </div>
      </div>
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
        <div className="overflow-x-auto rounded-md">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-1.5 font-medium whitespace-normal">
                  {ptBR.fields.paidOn}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-normal">
                  {ptBR.fields.amount}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-normal">
                  {ptBR.fields.location}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-normal">
                  {ptBR.fields.payerIdentity}
                </th>
                <th className="sticky right-0 z-[3] w-11 min-w-11 bg-background px-2 py-1.5 text-right font-medium whitespace-normal">
                  <span className="sr-only">{ptBR.aria.rowMenu}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-b border-border px-2 py-3 text-muted-foreground whitespace-nowrap"
                  >
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              ) : (
                list.data?.map((p) => (
                  <tr
                    key={p.id}
                    className="group border-b border-border/80 hover:bg-muted/40"
                  >
                    <td className="px-2 py-1.5 tabular-nums whitespace-nowrap">
                      {p.paidOn}
                    </td>
                    <td className="px-2 py-1.5 tabular-nums whitespace-nowrap">
                      {brlMinor(p.amountMinor)}
                    </td>
                    <td className="px-2 py-1.5 align-middle">{p.location}</td>
                    <td className="px-2 py-1.5 align-middle">
                      {p.payerIdentity}
                    </td>
                    <td className="sticky right-0 z-[2] w-11 min-w-11 cursor-default bg-background px-2 py-1.5 align-middle whitespace-nowrap group-hover:bg-muted/40">
                      <div className="flex justify-end">
                        <RowKebabMenu
                          ariaLabel={ptBR.aria.rowMenu}
                          iconOrientation="horizontal"
                        >
                          <Link
                            role="menuitem"
                            {...paymentEditLink({
                              ...pay,
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
                                globalThis.confirm(
                                  "Excluir este pagamento?",
                                ) !== true
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
