import { useEffect, useMemo, useState } from "react";
import type { Trip } from "@/lib/schemas/trip";
import { tripCreateSchema, tripUpdateSchema } from "@/lib/schemas/trip";
import { Button } from "@/components/ui/button";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiPatchJson, apiPostJson } from "@/lib/api-client";
import {
  fetchPageRequestSchema,
  landingMetadataSchema,
} from "@/lib/schemas/metadata";
import { ptBR } from "@/messages/pt-BR";

type Mode = "create" | "edit";

type TripFormSnapshot = {
  defaultExpectedAmountMinor: string;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
};

function tripBaseline(trip: Trip | undefined, mode: Mode): TripFormSnapshot {
  if (mode === "create" || !trip) {
    return {
      defaultExpectedAmountMinor: "",
      url: "",
      title: "",
      description: "",
      imageUrl: "",
    };
  }
  return {
    defaultExpectedAmountMinor:
      trip.defaultExpectedAmountMinor != null
        ? String(trip.defaultExpectedAmountMinor)
        : "",
    url: trip.url ?? "",
    title: trip.title ?? "",
    description: trip.description ?? "",
    imageUrl: trip.imageUrl ?? "",
  };
}

export function TripForm(props: {
  mode: Mode;
  schoolId: string;
  trip?: Trip;
  onSuccess: () => void;
}) {
  const { mode, schoolId, trip, onSuccess } = props;
  const [defaultExpectedAmountMinor, setDefaultExpectedAmountMinor] = useState(
    trip?.defaultExpectedAmountMinor != null
      ? String(trip.defaultExpectedAmountMinor)
      : "",
  );
  const [url, setUrl] = useState(trip?.url ?? "");
  const [title, setTitle] = useState(trip?.title ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");
  const [imageUrl, setImageUrl] = useState(trip?.imageUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseline = useMemo(() => tripBaseline(trip, mode), [trip, mode]);

  useEffect(() => {
    setDefaultExpectedAmountMinor(baseline.defaultExpectedAmountMinor);
    setUrl(baseline.url);
    setTitle(baseline.title);
    setDescription(baseline.description);
    setImageUrl(baseline.imageUrl);
    setError(null);
  }, [baseline]);

  const isDirty = useMemo(() => {
    const current: TripFormSnapshot = {
      defaultExpectedAmountMinor,
      url,
      title,
      description,
      imageUrl,
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [
    baseline,
    defaultExpectedAmountMinor,
    url,
    title,
    description,
    imageUrl,
  ]);

  useReportWorkspaceDirty(isDirty);

  async function fetchMetadata() {
    setError(null);
    const parsed = fetchPageRequestSchema.safeParse({ url: url.trim() });
    if (!parsed.success) {
      setError("Informe uma URL válida.");
      return;
    }
    setBusy(true);
    try {
      const raw = await apiPostJson<unknown>(
        "/metadata/fetch-page",
        parsed.data,
      );
      const meta = landingMetadataSchema.parse(raw);
      if (meta.title) {
        setTitle(meta.title);
      }
      if (meta.defaultExpectedAmountMinor != null) {
        setDefaultExpectedAmountMinor(String(meta.defaultExpectedAmountMinor));
      }
      if (meta.description) {
        setDescription(meta.description);
      }
      if (meta.imageUrl) {
        setImageUrl(meta.imageUrl);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 502) {
        setError(
          "Não foi possível buscar a página. Preencha os campos manualmente.",
        );
      } else {
        setError("Falha ao buscar metadados.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const minor =
        defaultExpectedAmountMinor.trim() === ""
          ? null
          : Number(defaultExpectedAmountMinor);
      if (minor !== null && (Number.isNaN(minor) || minor < 0)) {
        setError("Valor esperado inválido (centavos).");
        setBusy(false);
        return;
      }
      if (mode === "create") {
        const body = tripCreateSchema.parse({
          defaultExpectedAmountMinor: minor,
          url: url.trim() || null,
          title: title.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          active: true,
        });
        await apiPostJson(`/schools/${schoolId}/trips`, body);
      } else if (trip) {
        const body = tripUpdateSchema.parse({
          url: url.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          active: trip.active,
        });
        await apiPatchJson(`/trips/${trip.id}`, body);
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        const b = err.body as { message?: string } | null;
        setError(
          typeof b?.message === "string" ? b.message : "Erro ao salvar.",
        );
      } else {
        setError("Erro ao salvar.");
      }
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full min-w-0 rounded border border-input bg-background px-2 py-1";
  const readOnlyFieldClass = `${fieldClass} cursor-not-allowed bg-muted/60 text-muted-foreground`;

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-2xl rounded-md md:max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-3">
        {error ? (
          <p
            className="text-sm text-red-600 md:col-span-2 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
          <span>{ptBR.fields.url}</span>
          <input
            className={fieldClass}
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
            placeholder="https://"
          />
        </label>
        <div className="md:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={fetchMetadata}
          >
            {ptBR.actions.fetchMetadata}
          </Button>
        </div>
        <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
          <span>{ptBR.fields.defaultExpectedAmount}</span>
          <input
            className={readOnlyFieldClass}
            readOnly
            aria-readonly="true"
            inputMode="numeric"
            value={defaultExpectedAmountMinor}
            placeholder="ex.: 15000 (= R$ 150,00)"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
          <span>Título</span>
          <input
            className={readOnlyFieldClass}
            readOnly
            aria-readonly="true"
            value={title}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
          <span>Descrição</span>
          <textarea
            className={`min-h-[4rem] ${fieldClass}`}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>URL da imagem</span>
          <input
            className={fieldClass}
            value={imageUrl}
            onChange={(ev) => setImageUrl(ev.target.value)}
          />
        </label>
        <div className="flex justify-end pt-1 md:col-span-2">
          <Button type="submit" disabled={busy}>
            {ptBR.actions.save}
          </Button>
        </div>
      </div>
    </form>
  );
}
