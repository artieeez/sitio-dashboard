import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { useEffect, useMemo, useRef } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

import { ApiError, apiPostJson } from "@/lib/api-client";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export type TripImageFilePondProps = {
  /** Current cover URL (product image, saved trip, or last upload). Drives FilePond when it changes. */
  coverImageUrl: string;
  disabled?: boolean;
  onUploaded: (payload: { imageUrl: string; wixMediaFileId: string }) => void;
  onRemove?: () => void;
};

export function TripImageFilePond({
  coverImageUrl,
  disabled,
  onUploaded,
  onRemove,
}: TripImageFilePondProps) {
  const pondRef = useRef<InstanceType<typeof FilePond> | null>(null);
  const syncingFromParent = useRef(false);
  const lastSyncedCoverUrl = useRef<string | null>(null);
  const onUploadedRef = useRef(onUploaded);
  onUploadedRef.current = onUploaded;

  useEffect(() => {
    const apply = (): boolean => {
      const u = coverImageUrl.trim();
      const target = u.length > 0 ? u : null;
      const pond = pondRef.current;
      if (!pond) {
        return false;
      }
      if (target === lastSyncedCoverUrl.current) {
        return true;
      }
      lastSyncedCoverUrl.current = target;

      syncingFromParent.current = true;
      pond.removeFiles({ revert: false });

      if (u.length > 0) {
        void pond.addFile(u).finally(() => {
          syncingFromParent.current = false;
        });
      } else {
        syncingFromParent.current = false;
      }
      return true;
    };

    if (apply()) {
      return;
    }
    const id = requestAnimationFrame(() => {
      void apply();
    });
    return () => cancelAnimationFrame(id);
  }, [coverImageUrl]);

  const server = useMemo(
    () => ({
      load: (
        source: string,
        loadBlob: (blob: Blob) => void,
        error: (message: string) => void,
        _progress: (computable: boolean, loaded: number, total: number) => void,
        abort: () => void,
      ) => {
        const ac = new AbortController();
        fetch(source, { mode: "cors", signal: ac.signal })
          .then((r) => {
            if (!r.ok) {
              throw new Error(String(r.status));
            }
            return r.blob();
          })
          .then((blob) => loadBlob(blob))
          .catch(() => error("Não foi possível carregar a imagem."));
        return {
          abort: () => {
            ac.abort();
            abort();
          },
        };
      },
      process: (
        _fieldName: string,
        file: Blob & { name?: string },
        _metadata: unknown,
        load: (serverId: string) => void,
        err: (message: string) => void,
        progress: (
          isLengthComputable: boolean,
          loaded: number,
          total: number,
        ) => void,
        abort: () => void,
        _transfer?: unknown,
        _options?: unknown,
      ) => {
        const xhr = new XMLHttpRequest();
        let aborted = false;
        const fileName = file.name?.trim() || "upload.bin";

        void (async () => {
          let uploadUrl: string;
          try {
            const res = await apiPostJson<{ uploadUrl: string }>(
              "/integrations/wix/media/generate-upload-url",
              {
                mimeType: file.type || "application/octet-stream",
                fileName,
                sizeInBytes: file.size,
              },
            );
            uploadUrl = res.uploadUrl;
          } catch (e) {
            if (e instanceof ApiError) {
              const b = e.body as { message?: string } | null;
              err(
                typeof b?.message === "string"
                  ? b.message
                  : "Erro ao gerar URL de upload.",
              );
            } else {
              err("Erro ao gerar URL de upload.");
            }
            return;
          }

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader(
            "Content-Type",
            file.type || "application/octet-stream",
          );
          xhr.upload.onprogress = (e) => {
            progress(e.lengthComputable, e.loaded, e.total);
          };
          xhr.onload = () => {
            if (aborted) {
              return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const body = JSON.parse(xhr.responseText) as {
                  file?: { id?: string; url?: string };
                };
                const url = body.file?.url?.trim();
                const id = body.file?.id?.trim();
                if (!url || !id) {
                  err("Resposta de upload inválida.");
                  return;
                }
                lastSyncedCoverUrl.current = url;
                onUploadedRef.current({ imageUrl: url, wixMediaFileId: id });
                load(JSON.stringify({ imageUrl: url, wixMediaFileId: id }));
              } catch {
                err("Resposta de upload inválida.");
              }
            } else {
              err(xhr.responseText.slice(0, 500) || `Erro HTTP ${xhr.status}`);
            }
          };
          xhr.onerror = () => err("Falha de rede no upload.");
          xhr.send(file);
        })();

        return {
          abort: () => {
            aborted = true;
            xhr.abort();
            abort();
          },
        };
      },
    }),
    [],
  );

  return (
    <FilePond
      ref={pondRef}
      disabled={disabled}
      allowMultiple={false}
      maxFiles={1}
      acceptedFileTypes={ACCEPT}
      imagePreviewHeight={192}
      labelIdle='Arraste uma imagem ou <span class="filepond--label-action">escolha</span>'
      credits={false}
      server={server}
      onremovefile={() => {
        if (syncingFromParent.current) {
          return;
        }
        lastSyncedCoverUrl.current = null;
        onRemove?.();
      }}
    />
  );
}
