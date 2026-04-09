import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiPatchJson, apiPostJson } from "@/lib/api-client";
import {
  fetchPageRequestSchema,
  landingMetadataSchema,
} from "@/lib/schemas/metadata";
import type { Trip } from "@/lib/schemas/trip";
import { tripCreateSchema, tripUpdateSchema } from "@/lib/schemas/trip";
import { ptBR } from "@/messages/pt-BR";

type Mode = "create" | "edit";

type TripFormSnapshot = {
  defaultExpectedAmountMinor: string;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  faviconUrl: string;
};

function tripBaseline(trip: Trip | undefined, mode: Mode): TripFormSnapshot {
  if (mode === "create" || !trip) {
    return {
      defaultExpectedAmountMinor: "",
      url: "",
      title: "",
      description: "",
      imageUrl: "",
      faviconUrl: "",
      active: true,
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
    faviconUrl: trip.faviconUrl ?? "",
    active: trip.active ?? true,
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
  const [faviconUrl, setFaviconUrl] = useState(trip?.faviconUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseline = useMemo(() => tripBaseline(trip, mode), [trip, mode]);

  const isDirty = useMemo(() => {
    const current: TripFormSnapshot = {
      defaultExpectedAmountMinor,
      url,
      title,
      description,
      imageUrl,
      faviconUrl,
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [
    baseline,
    defaultExpectedAmountMinor,
    url,
    title,
    description,
    imageUrl,
    faviconUrl,
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
      if (meta.description) {
        setDescription(meta.description);
      }
      if (meta.imageUrl) {
        setImageUrl(meta.imageUrl);
      }
      if (meta.faviconUrl) {
        setFaviconUrl(meta.faviconUrl);
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
          faviconUrl: faviconUrl.trim() || null,
          active: true,
        });
        await apiPostJson(`/schools/${schoolId}/trips`, body);
      } else if (trip) {
        const body = tripUpdateSchema.parse({
          defaultExpectedAmountMinor: minor,
          url: url.trim() || null,
          title: title.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          faviconUrl: faviconUrl.trim() || null,
          active: trip?.active ?? true,
        });
        await apiPatchJson(`/trips/${trip.id}`, body);
      }
      onSuccess();
    } catch (e) {
      if (e instanceof ApiError) {
        const b = e.body as { message?: string } | null;
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

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-md">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.defaultExpectedAmount}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          inputMode="numeric"
          value={defaultExpectedAmountMinor}
          onChange={(ev) => setDefaultExpectedAmountMinor(ev.target.value)}
          placeholder="ex.: 15000 (= R$ 150,00)"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.url}</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={url}
          onChange={(ev) => setUrl(ev.target.value)}
          placeholder="https://"
        />
      </label>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={fetchMetadata}
      >
        {ptBR.actions.fetchMetadata}
      </Button>
      <label className="flex flex-col gap-1 text-sm">
        <span>Título</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Descrição</span>
        <textarea
          className="min-h-[4rem] rounded border border-input bg-background px-2 py-1"
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>URL da imagem</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={imageUrl}
          onChange={(ev) => setImageUrl(ev.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Favicon</span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={faviconUrl}
          onChange={(ev) => setFaviconUrl(ev.target.value)}
        />
      </label>
      <Button type="submit" disabled={busy}>
        {ptBR.actions.save}
      </Button>
    </form>
  );
}
