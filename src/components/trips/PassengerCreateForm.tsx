import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiPostJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  passengerCreateSchema,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
import { ptBR } from "@/messages/pt-BR";

export function PassengerCreateForm(props: {
  tripId: string;
  /** Called after a successful create (after cache invalidation). */
  onCreated?: () => void;
}) {
  const { tripId, onCreated } = props;
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhoneNumber, setParentPhoneNumber] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [expectedOverride, setExpectedOverride] = useState("");
  const [confirmNameDuplicate, setConfirmNameDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () =>
      fullName.trim() !== "" ||
      cpf.trim() !== "" ||
      parentName.trim() !== "" ||
      parentPhoneNumber.trim() !== "" ||
      parentEmail.trim() !== "" ||
      expectedOverride.trim() !== "" ||
      confirmNameDuplicate,
    [
      fullName,
      cpf,
      parentName,
      parentPhoneNumber,
      parentEmail,
      expectedOverride,
      confirmNameDuplicate,
    ],
  );

  useReportWorkspaceDirty(isDirty);

  const create = useMutation({
    mutationFn: async () => {
      const minor =
        expectedOverride.trim() === "" ? undefined : Number(expectedOverride);
      if (minor !== undefined && (Number.isNaN(minor) || minor < 0)) {
        throw new Error("Valor inválido");
      }
      const body = passengerCreateSchema.parse({
        fullName: fullName.trim(),
        cpf: cpf.trim() || null,
        parentName: parentName.trim() || null,
        parentPhoneNumber: parentPhoneNumber.trim() || null,
        parentEmail: parentEmail.trim() || null,
        expectedAmountOverrideMinor: minor ?? null,
        confirmNameDuplicate,
      });
      const raw = await apiPostJson<unknown>(
        `/trips/${tripId}/passengers`,
        body,
      );
      return passengerWithStatusSchema.parse(raw);
    },
    onSuccess: async () => {
      setError(null);
      setFullName("");
      setCpf("");
      setParentName("");
      setParentPhoneNumber("");
      setParentEmail("");
      setExpectedOverride("");
      setConfirmNameDuplicate(false);
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, false),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, true),
      });
      await qc.invalidateQueries({
        queryKey: ["passengerAggregates", tripId],
      });
      onCreated?.();
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError && e.status === 428) {
        setError(
          "Nome duplicado nesta viagem. Marque a confirmação abaixo e salve novamente.",
        );
        return;
      }
      if (e instanceof ApiError) {
        const b = e.body as { message?: string } | null;
        setError(typeof b?.message === "string" ? b.message : "Erro ao criar.");
        return;
      }
      if (e instanceof Error && e.message === "Valor inválido") {
        setError("Valor esperado (passageiro) inválido.");
        return;
      }
      setError("Erro ao criar passageiro.");
    },
  });

  return (
    <form
      className="flex max-w-xl flex-col gap-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        setError(null);
        create.mutate();
      }}
    >
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.fullName}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={fullName}
          onChange={(ev) => setFullName(ev.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.cpf}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={cpf}
          onChange={(ev) => setCpf(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.parentName}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={parentName}
          onChange={(ev) => setParentName(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.parentPhone}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={parentPhoneNumber}
          onChange={(ev) => setParentPhoneNumber(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.parentEmail}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          type="email"
          value={parentEmail}
          onChange={(ev) => setParentEmail(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.expectedAmountOverride}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          inputMode="numeric"
          value={expectedOverride}
          onChange={(ev) => setExpectedOverride(ev.target.value)}
          placeholder="centavos, opcional"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmNameDuplicate}
          onChange={(ev) => setConfirmNameDuplicate(ev.target.checked)}
        />
        Confirmar nome duplicado na viagem
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={create.isPending}>
          {ptBR.actions.save}
        </Button>
      </div>
    </form>
  );
}
