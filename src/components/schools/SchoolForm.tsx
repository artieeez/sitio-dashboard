import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseline = useMemo(() => schoolBaseline(school, mode), [school, mode]);

  const isDirty = useMemo(() => {
    const current: SchoolFormSnapshot = {
      url,
      title,
      description,
      imageUrl,
      faviconUrl,
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [baseline, url, title, description, imageUrl, faviconUrl]);

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
    <form
      onSubmit={submit}
      className="flex max-w-xl flex-col gap-3 rounded-md border border-border p-4"
    >
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
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
