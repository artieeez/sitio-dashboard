import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";

import { WixProductAutocomplete } from "@/components/trips/wix-product-autocomplete";
import { FormFooter } from "@/components/ui/form-footer";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiJson, apiPatchJson, apiPostJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { schoolSchema } from "@/lib/schemas/school";
import type { Trip } from "@/lib/schemas/trip";
import { tripCreateSchema, tripUpdateSchema } from "@/lib/schemas/trip";
import { wixProductSummarySchema } from "@/lib/schemas/wix-product";
import { ptBR } from "@/messages/pt-BR";

type Mode = "create" | "edit";

type TripFormSnapshot = {
  defaultExpectedAmountMinor: string;
  title: string;
  description: string;
  imageUrl: string;
  wixProductId: string | null;
  wixProductSlug: string | null;
  wixProductPageUrl: string | null;
};

function tripBaseline(trip: Trip | undefined, mode: Mode): TripFormSnapshot {
  if (mode === "create" || !trip) {
    return {
      defaultExpectedAmountMinor: "",
      title: "",
      description: "",
      imageUrl: "",
      wixProductId: null,
      wixProductSlug: null,
      wixProductPageUrl: null,
    };
  }
  return {
    defaultExpectedAmountMinor:
      trip.defaultExpectedAmountMinor != null
        ? String(trip.defaultExpectedAmountMinor)
        : "",
    title: trip.title ?? "",
    description: trip.description ?? "",
    imageUrl: trip.imageUrl ?? "",
    wixProductId: trip.wixProductId,
    wixProductSlug: trip.wixProductSlug?.trim() || null,
    wixProductPageUrl: trip.wixProductPageUrl?.trim() || null,
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
  const [title, setTitle] = useState(trip?.title ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");
  const [imageUrl, setImageUrl] = useState(trip?.imageUrl ?? "");
  const [wixProductId, setWixProductId] = useState<string | null>(
    trip?.wixProductId ?? null,
  );
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [wixProductSlug, setWixProductSlug] = useState(
    trip?.wixProductSlug ?? "",
  );
  const [wixProductPageUrl, setWixProductPageUrl] = useState(
    trip?.wixProductPageUrl ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCommitted, setSaveCommitted] = useState(false);

  const baseline = useMemo(() => tripBaseline(trip, mode), [trip, mode]);

  const schoolQuery = useQuery({
    queryKey: queryKeys.school(schoolId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/schools/${schoolId}`);
      return schoolSchema.parse(raw);
    },
    enabled: mode === "create",
  });

  useEffect(() => {
    setSaveCommitted(false);
    setDefaultExpectedAmountMinor(baseline.defaultExpectedAmountMinor);
    setTitle(baseline.title);
    setDescription(baseline.description);
    setImageUrl(baseline.imageUrl);
    setWixProductId(baseline.wixProductId);
    setPickedName(null);
    setWixProductSlug(baseline.wixProductSlug ?? "");
    setWixProductPageUrl(baseline.wixProductPageUrl ?? "");
    setError(null);
  }, [baseline]);

  const isDirty = useMemo(() => {
    if (saveCommitted) {
      return false;
    }
    const current: TripFormSnapshot = {
      defaultExpectedAmountMinor,
      title,
      description,
      imageUrl,
      wixProductId,
      wixProductSlug: wixProductSlug.trim() || null,
      wixProductPageUrl: wixProductPageUrl.trim() || null,
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [
    saveCommitted,
    baseline,
    defaultExpectedAmountMinor,
    title,
    description,
    imageUrl,
    wixProductId,
    wixProductSlug,
    wixProductPageUrl,
  ]);

  useReportWorkspaceDirty(isDirty);

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
        if (!schoolQuery.data?.wixCollectionId?.trim()) {
          setError(ptBR.tripWorkspace.tripNewRequiresWixCollection);
          setSubmitting(false);
          return;
        }
        if (!wixProductId?.trim()) {
          setError("Selecione um produto Wix.");
          setSubmitting(false);
          return;
        }
        const body = tripCreateSchema.parse({
          wixProductId: wixProductId.trim(),
          wixProductSlug: wixProductSlug.trim() || null,
          wixProductPageUrl: wixProductPageUrl.trim() || null,
          defaultExpectedAmountMinor: minor,
          title: title.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          active: true,
        });
        await apiPostJson(`/schools/${schoolId}/trips`, body);
      } else if (trip) {
        const body = tripUpdateSchema.parse({
          description: description.trim() || null,
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

  const schoolReady = mode !== "create" || schoolQuery.isSuccess;
  const hasWixCollection =
    mode === "create" && !!schoolQuery.data?.wixCollectionId?.trim();

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

        {mode === "create" && schoolQuery.isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm md:col-span-2">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Carregando escola…
          </div>
        ) : null}

        {mode === "create" && schoolQuery.isError ? (
          <p className="text-destructive text-sm md:col-span-2" role="alert">
            Não foi possível carregar a escola.
          </p>
        ) : null}

        {mode === "create" && schoolQuery.isSuccess && !hasWixCollection ? (
          <p
            className="text-amber-800 md:col-span-2 dark:text-amber-200"
            role="status"
          >
            {ptBR.tripWorkspace.tripNewRequiresWixCollection}
          </p>
        ) : null}

        {mode === "create" && hasWixCollection ? (
          <div className="md:col-span-2">
            <WixProductAutocomplete
              schoolId={schoolId}
              valueId={wixProductId}
              valueName={
                pickedName ?? (title.trim() ? title : wixProductId ? "…" : null)
              }
              disabled={submitting || detailLoading}
              onSelect={(s) => {
                setWixProductId(s.id);
                setPickedName(s.name);
                setTitle(s.name);
                setDetailLoading(true);
                setError(null);
                void (async () => {
                  try {
                    const raw = await apiJson<unknown>(
                      `/integrations/wix/products/${encodeURIComponent(s.id)}`,
                    );
                    const full = wixProductSummarySchema.parse(raw);
                    setTitle(full.name);
                    setDescription(full.description?.trim() ?? "");
                    setImageUrl(full.imageUrl ?? "");
                    setWixProductSlug(full.slug ?? "");
                    setWixProductPageUrl(full.productPageUrl ?? "");
                    if (full.defaultExpectedAmountMinor != null) {
                      setDefaultExpectedAmountMinor(
                        String(full.defaultExpectedAmountMinor),
                      );
                    }
                  } catch {
                    setError("Não foi possível carregar os dados do produto.");
                  } finally {
                    setDetailLoading(false);
                  }
                })();
              }}
              onClear={() => {
                setWixProductId(null);
                setPickedName(null);
                setWixProductSlug("");
                setWixProductPageUrl("");
                setTitle("");
                setDescription("");
                setImageUrl("");
                setDefaultExpectedAmountMinor("");
              }}
            />
            {detailLoading ? (
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Carregando produto…
              </p>
            ) : null}
          </div>
        ) : null}

        {schoolReady ? (
          <>
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
              <span>{ptBR.fields.title}</span>
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

            {mode === "create" && wixProductId ? (
              <>
                <div className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
                  <span>{ptBR.fields.wixProductId}</span>
                  <span className="border-input bg-muted/40 rounded-md border px-3 py-2 font-mono text-xs">
                    {wixProductId}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
                  <span>{ptBR.fields.slug}</span>
                  <span className="border-input bg-muted/40 rounded-md border px-3 py-2 text-sm">
                    {wixProductSlug || "—"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
                  <span>{ptBR.fields.wixProductPageUrl}</span>
                  {wixProductPageUrl.trim().length > 0 ? (
                    <a
                      href={wixProductPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm underline"
                    >
                      {wixProductPageUrl}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </>
            ) : null}

            {mode === "edit" && trip?.wixProductId ? (
              <>
                <div className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
                  <span>{ptBR.fields.wixProductId}</span>
                  <span className="border-input bg-muted/40 rounded-md border px-3 py-2 font-mono text-xs">
                    {trip.wixProductId}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
                  <span>{ptBR.fields.slug}</span>
                  <span className="border-input bg-muted/40 rounded-md border px-3 py-2 text-sm">
                    {trip.wixProductSlug || "—"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
                  <span>{ptBR.fields.wixProductPageUrl}</span>
                  {trip.wixProductPageUrl &&
                  trip.wixProductPageUrl.length > 0 ? (
                    <a
                      href={trip.wixProductPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm underline"
                    >
                      {trip.wixProductPageUrl}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </>
            ) : null}

            <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
              <span className="text-sm">{ptBR.fields.imagePreview}</span>
              {imageUrl.trim().length > 0 ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="border-input max-h-48 max-w-full rounded-md border object-contain"
                />
              ) : (
                <p className="text-muted-foreground text-sm">—</p>
              )}
            </div>
          </>
        ) : null}

        <FormFooter
          className="pt-1 md:col-span-2"
          primaryProps={{
            disabled:
              submitting ||
              (mode === "create" &&
                (!schoolQuery.isSuccess || !hasWixCollection || !wixProductId)),
          }}
        >
          {ptBR.actions.save}
        </FormFooter>
      </div>
    </form>
  );
}
