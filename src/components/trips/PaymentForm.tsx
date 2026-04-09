import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiPatchJson, apiPostJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  type Payment,
  paymentCreateSchema,
  paymentSchema,
  paymentUpdateSchema,
} from "@/lib/schemas/payment";
import { ptBR } from "@/messages/pt-BR";

function brlMinorHint(minor: number): string {
  return (minor / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type PaymentFieldBaseline = {
  amountMinor: string;
  paidOn: string;
  location: string;
  payerIdentity: string;
};

function paymentFormBaseline(props: {
  mode: "create" | "edit";
  payment?: Payment;
  defaultAmountMinor?: number | null;
}): PaymentFieldBaseline {
  const { mode, payment, defaultAmountMinor } = props;
  if (mode === "edit" && payment) {
    return {
      amountMinor: String(payment.amountMinor),
      paidOn: payment.paidOn,
      location: payment.location.trim(),
      payerIdentity: payment.payerIdentity.trim(),
    };
  }
  return {
    amountMinor: defaultAmountMinor != null ? String(defaultAmountMinor) : "",
    paidOn: payment?.paidOn ?? new Date().toISOString().slice(0, 10),
    location: "",
    payerIdentity: "",
  };
}

export function PaymentForm(props: {
  tripId: string;
  passengerId: string;
  /** Prefill amount (centavos) when creating. */
  defaultAmountMinor?: number | null;
  mode?: "create" | "edit";
  payment?: Payment;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const {
    tripId,
    passengerId,
    defaultAmountMinor,
    mode = "create",
    payment,
    onSuccess,
    onCancel,
  } = props;
  const qc = useQueryClient();
  const [amountMinor, setAmountMinor] = useState(
    () =>
      paymentFormBaseline({ mode, payment, defaultAmountMinor }).amountMinor,
  );
  const [paidOn, setPaidOn] = useState(
    () => paymentFormBaseline({ mode, payment, defaultAmountMinor }).paidOn,
  );
  const [location, setLocation] = useState(() => payment?.location ?? "");
  const [payerIdentity, setPayerIdentity] = useState(
    () => payment?.payerIdentity ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const baseline = useMemo(
    () => paymentFormBaseline({ mode, payment, defaultAmountMinor }),
    [mode, payment, defaultAmountMinor],
  );

  const isDirty = useMemo(() => {
    return (
      amountMinor !== baseline.amountMinor ||
      paidOn !== baseline.paidOn ||
      location.trim() !== baseline.location ||
      payerIdentity.trim() !== baseline.payerIdentity
    );
  }, [amountMinor, paidOn, location, payerIdentity, baseline]);

  useReportWorkspaceDirty(isDirty);

  const save = useMutation({
    mutationFn: async () => {
      const minor = Number.parseInt(amountMinor, 10);
      if (Number.isNaN(minor) || minor < 0) {
        throw new Error("INVALID_AMOUNT");
      }
      if (mode === "edit" && payment) {
        const body = paymentUpdateSchema.parse({
          amountMinor: minor,
          paidOn,
          location: location.trim(),
          payerIdentity: payerIdentity.trim(),
        });
        const raw = await apiPatchJson<unknown>(
          `/payments/${payment.id}`,
          body,
        );
        return paymentSchema.parse(raw);
      }
      const body = paymentCreateSchema.parse({
        amountMinor: minor,
        paidOn,
        location: location.trim(),
        payerIdentity: payerIdentity.trim(),
      });
      const raw = await apiPostJson<unknown>(
        `/passengers/${passengerId}/payments`,
        body,
      );
      return paymentSchema.parse(raw);
    },
    onSuccess: async () => {
      setError(null);
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
      onSuccess?.();
    },
    onError: (e: unknown) => {
      if (e instanceof Error && e.message === "INVALID_AMOUNT") {
        setError("Valor inválido (use centavos inteiros, ≥ 0).");
        return;
      }
      if (e instanceof ApiError) {
        const b = e.body as { message?: string; code?: string } | null;
        setError(
          typeof b?.message === "string"
            ? b.message
            : "Erro ao salvar pagamento.",
        );
        return;
      }
      setError("Erro ao salvar pagamento.");
    },
  });

  const preview =
    amountMinor.trim() !== "" && !Number.isNaN(Number.parseInt(amountMinor, 10))
      ? brlMinorHint(Number.parseInt(amountMinor, 10))
      : null;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        setError(null);
        save.mutate();
      }}
    >
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.amount} (centavos)</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          inputMode="numeric"
          value={amountMinor}
          onChange={(ev) => setAmountMinor(ev.target.value)}
          required
        />
        {preview ? (
          <span className="text-xs text-muted-foreground">{preview}</span>
        ) : null}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.paidOn}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          type="date"
          value={paidOn}
          onChange={(ev) => setPaidOn(ev.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.location}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={location}
          onChange={(ev) => setLocation(ev.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.payerIdentity}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={payerIdentity}
          onChange={(ev) => setPayerIdentity(ev.target.value)}
          required
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={save.isPending}>
          {ptBR.actions.save}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={save.isPending}
          >
            {ptBR.actions.cancel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
