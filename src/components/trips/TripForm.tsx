import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Trip } from "@/lib/schemas/trip";
import { tripCreateSchema, tripUpdateSchema } from "@/lib/schemas/trip";
import { FormFooter } from "@/components/ui/form-footer";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiPatchJson, apiPostJson } from "@/lib/api-client";
import {
  fetchPageRequestSchema,
  landingMetadataSchema,
} from "@/lib/schemas/metadata";
import { ptBR } from "@/messages/pt-BR";

const METADATA_DEBOUNCE_MS = 600;

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
  const [submitting, setSubmitting] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCommitted, setSaveCommitted] = useState(false);
  const metadataAbortRef = useRef<AbortController | null>(null);
  const metadataGenerationRef = useRef(0);

  const baseline = useMemo(() => tripBaseline(trip, mode), [trip, mode]);

  useEffect(() => {
    setSaveCommitted(false);
    setDefaultExpectedAmountMinor(baseline.defaultExpectedAmountMinor);
    setUrl(baseline.url);
    setTitle(baseline.title);
    setDescription(baseline.description);
    setImageUrl(baseline.imageUrl);
    setError(null);
  }, [baseline]);

  const isDirty = useMemo(() => {
    if (saveCommitted) {
      return false;
    }
    const current: TripFormSnapshot = {
      defaultExpectedAmountMinor,
      url,
      title,
      description,
      imageUrl,
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [
    saveCommitted,
    baseline,
    defaultExpectedAmountMinor,
    url,
    title,
    description,
    imageUrl,
  ]);

  useReportWorkspaceDirty(isDirty);

  useEffect(() => {
    const trimmed = url.trim();
    if (trimmed === baseline.url.trim()) {
      return;
    }
    const parsed = fetchPageRequestSchema.safeParse({ url: trimmed });
    if (!parsed.success) {
      return;
    }

    const generation = metadataGenerationRef.current;
    const timeoutId = window.setTimeout(() => {
      if (metadataGenerationRef.current !== generation) return;

      metadataAbortRef.current?.abort();
      const ac = new AbortController();
      metadataAbortRef.current = ac;

      void (async () => {
        setMetadataLoading(true);
        setError(null);
        try {
          const raw = await apiPostJson<unknown>(
            "/metadata/fetch-page",
            parsed.data,
            { signal: ac.signal },
          );
          if (
            ac.signal.aborted ||
            metadataGenerationRef.current !== generation
          ) {
            return;
          }
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
          if (
            ac.signal.aborted ||
            metadataGenerationRef.current !== generation
          ) {
            return;
          }
          if (e instanceof ApiError && e.status === 502) {
            setError(
              "Não foi possível buscar a página. Preencha os campos manualmente.",
            );
          } else {
            setError("Falha ao buscar metadados.");
          }
        } finally {
          if (
            metadataGenerationRef.current === generation &&
            !ac.signal.aborted
          ) {
            setMetadataLoading(false);
          }
        }
      })();
    }, METADATA_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      metadataAbortRef.current?.abort();
      metadataAbortRef.current = null;
      metadataGenerationRef.current += 1;
      setMetadataLoading(false);
    };
  }, [url, baseline.url]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const minor =
        defaultExpectedAmountMinor.trim() === ""
          ? null
          : Number(defaultExpectedAmountMinor);
      if (minor !== null && (Number.isNaN(minor) || minor < 0)) {
        setError("Valor esperado inválido (centavos).");
        setSubmitting(false);
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
      flushSync(() => {
        setSaveCommitted(true);
      });
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
      setSubmitting(false);
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
          <span className="flex items-center gap-2">
            {ptBR.fields.url}
            {metadataLoading ? (
              <Loader2
                className="size-4 shrink-0 animate-spin text-muted-foreground"
                aria-hidden
              />
            ) : null}
            {metadataLoading ? (
              <span className="sr-only">Carregando dados da página…</span>
            ) : null}
          </span>
          <input
            className={fieldClass}
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
            placeholder="https://"
            aria-busy={metadataLoading}
          />
        </label>
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
        <FormFooter className="pt-1 md:col-span-2" primaryProps={{ disabled: submitting }}>
          {ptBR.actions.save}
        </FormFooter>
      </div>
    </form>
  );
}
