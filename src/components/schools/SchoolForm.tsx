import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { WixCollectionAutocomplete } from "@/components/schools/wix-collection-autocomplete";
import { WixCollectionCard } from "@/components/schools/wix-collection-card";
import { FormFooter } from "@/components/ui/form-footer";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiJson, apiPatchJson, apiPostJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchPageRequestSchema,
  landingMetadataSchema,
} from "@/lib/schemas/metadata";
import {
  type School,
  schoolCreateSchema,
  schoolUpdateSchema,
} from "@/lib/schemas/school";
import {
  type WixCollectionSummary,
  wixCollectionSummarySchema,
} from "@/lib/schemas/wix-collection";
import { ptBR } from "@/messages/pt-BR";

const METADATA_DEBOUNCE_MS = 600;

type Mode = "create" | "edit";

type SchoolFormSnapshot = {
  wixCollectionId: string | null;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  faviconUrl: string;
};

function schoolBaseline(
  school: School | undefined,
  mode: Mode,
): SchoolFormSnapshot {
  if (mode === "create" || !school) {
    return {
      wixCollectionId: null,
      url: "",
      title: "",
      description: "",
      imageUrl: "",
      faviconUrl: "",
    };
  }
  return {
    wixCollectionId: school.wixCollectionId ?? null,
    url: school.url ?? "",
    title: school.title ?? "",
    description: school.description ?? "",
    imageUrl: school.imageUrl ?? "",
    faviconUrl: school.faviconUrl ?? "",
  };
}

export function SchoolForm(props: {
  mode: Mode;
  school?: School;
  onSuccess: () => void;
}) {
  const { mode, school, onSuccess } = props;
  const [wixCollectionId, setWixCollectionId] = useState<string | null>(
    () => school?.wixCollectionId ?? null,
  );
  const [pickedSummary, setPickedSummary] =
    useState<WixCollectionSummary | null>(null);
  const [url, setUrl] = useState(school?.url ?? "");
  const [title, setTitle] = useState(school?.title ?? "");
  const [description, setDescription] = useState(school?.description ?? "");
  const [imageUrl, setImageUrl] = useState(school?.imageUrl ?? "");
  const [faviconUrl, setFaviconUrl] = useState(school?.faviconUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCommitted, setSaveCommitted] = useState(false);
  const metadataAbortRef = useRef<AbortController | null>(null);
  const metadataGenerationRef = useRef(0);

  const baseline = useMemo(() => schoolBaseline(school, mode), [school, mode]);

  useEffect(() => {
    setSaveCommitted(false);
    setWixCollectionId(baseline.wixCollectionId);
    setPickedSummary(null);
    setUrl(baseline.url);
    setTitle(baseline.title);
    setDescription(baseline.description);
    setImageUrl(baseline.imageUrl);
    setFaviconUrl(baseline.faviconUrl);
    setError(null);
  }, [baseline]);

  const remoteCollectionQuery = useQuery({
    queryKey: queryKeys.wixCollection(wixCollectionId ?? ""),
    queryFn: async () => {
      const id = wixCollectionId;
      if (!id) throw new Error("missing id");
      const raw = await apiJson<unknown>(
        `/integrations/wix/collections/${encodeURIComponent(id)}`,
      );
      return wixCollectionSummarySchema.parse(raw);
    },
    enabled: mode === "edit" && !!wixCollectionId && !pickedSummary,
  });

  const displaySummary = pickedSummary ?? remoteCollectionQuery.data ?? null;

  const isDirty = useMemo(() => {
    if (saveCommitted) {
      return false;
    }
    const current: SchoolFormSnapshot = {
      wixCollectionId,
      url,
      title,
      description,
      imageUrl,
      faviconUrl,
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [
    saveCommitted,
    baseline,
    wixCollectionId,
    url,
    title,
    description,
    imageUrl,
    faviconUrl,
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
          if (meta.faviconUrl) {
            setFaviconUrl(meta.faviconUrl);
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
              "Não foi possível buscar a página. Preencha o favicon manualmente.",
            );
          } else {
            setError("Falha ao buscar favicon.");
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
      if (mode === "create") {
        const body = schoolCreateSchema.parse({
          wixCollectionId: wixCollectionId?.trim() || null,
          url: url.trim() || null,
          title: title.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          faviconUrl: faviconUrl.trim() || null,
          active: true,
        });
        await apiPostJson("/schools", body);
      } else if (school) {
        const body = schoolUpdateSchema.parse({
          wixCollectionId: wixCollectionId?.trim() || null,
          url: url.trim() || null,
          title: title.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          faviconUrl: faviconUrl.trim() || null,
          active: school?.active ?? true,
        });
        await apiPatchJson(`/schools/${school.id}`, body);
      }
      flushSync(() => {
        setSaveCommitted(true);
      });
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
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <WixCollectionAutocomplete
        valueId={wixCollectionId}
        valueName={
          pickedSummary?.name ??
          remoteCollectionQuery.data?.name ??
          (wixCollectionId && remoteCollectionQuery.isPending ? "…" : null)
        }
        disabled={submitting}
        onSelect={(s) => {
          setWixCollectionId(s.id);
          setPickedSummary(s);
          setTitle(s.name);
          setDescription(s.description?.trim() ?? "");
          setImageUrl(s.imageUrl ?? "");
        }}
        onClear={() => {
          setWixCollectionId(null);
          setPickedSummary(null);
        }}
      />

      {wixCollectionId && displaySummary ? (
        <WixCollectionCard summary={displaySummary} />
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="flex items-center gap-2">
          {ptBR.fields.schoolUrlForFaviconOnly}
          {metadataLoading ? (
            <Loader2
              className="size-4 shrink-0 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : null}
          {metadataLoading ? (
            <span className="sr-only">Carregando favicon…</span>
          ) : null}
        </span>
        <input
          className="rounded border border-input bg-background px-2 py-1"
          value={url}
          onChange={(ev) => setUrl(ev.target.value)}
          placeholder="https://"
          aria-busy={metadataLoading}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{ptBR.fields.title}</span>
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
      <FormFooter primaryProps={{ disabled: submitting }}>
        {ptBR.actions.save}
      </FormFooter>
    </form>
  );
}
