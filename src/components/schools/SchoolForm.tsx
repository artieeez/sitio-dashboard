import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FormFooter } from "@/components/ui/form-footer";
import { useReportWorkspaceDirty } from "@/contexts/workspace-dirty-context";
import { ApiError, apiPatchJson, apiPostJson } from "@/lib/api-client";
import {
  fetchPageRequestSchema,
  landingMetadataSchema,
} from "@/lib/schemas/metadata";
import {
  type School,
  schoolCreateSchema,
  schoolUpdateSchema,
} from "@/lib/schemas/school";
import { ptBR } from "@/messages/pt-BR";

const METADATA_DEBOUNCE_MS = 600;

type Mode = "create" | "edit";

type SchoolFormSnapshot = {
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
      url: "",
      title: "",
      description: "",
      imageUrl: "",
      faviconUrl: "",
    };
  }
  return {
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
    setUrl(baseline.url);
    setTitle(baseline.title);
    setDescription(baseline.description);
    setImageUrl(baseline.imageUrl);
    setFaviconUrl(baseline.faviconUrl);
    setError(null);
  }, [baseline]);

  const isDirty = useMemo(() => {
    if (saveCommitted) {
      return false;
    }
    const current: SchoolFormSnapshot = {
      url,
      title,
      description,
      imageUrl,
      faviconUrl,
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [saveCommitted, baseline, url, title, description, imageUrl, faviconUrl]);

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
      if (mode === "create") {
        const body = schoolCreateSchema.parse({
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
      <label className="flex flex-col gap-1 text-sm">
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
          className="rounded border border-input bg-background px-2 py-1"
          value={url}
          onChange={(ev) => setUrl(ev.target.value)}
          placeholder="https://"
          aria-busy={metadataLoading}
        />
      </label>
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
      <FormFooter primaryProps={{ disabled: submitting }}>
        {ptBR.actions.save}
      </FormFooter>
    </form>
  );
}
