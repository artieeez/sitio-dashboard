import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { useEffect, useMemo, useRef } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

import { ApiError, apiPostJson } from "@/lib/api-client";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function displayNameFromImageUrl(u: string): string {
  try {
    const parts = new URL(u).pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last?.includes(".")) {
      return last;
    }
  } catch {
    /* ignore */
  }
  return "cover.png";
}

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
  /** Tracks which remote URL the current fetch/add belongs to (cleared in finish paths). */
  const loadInFlightTarget = useRef<string | null>(null);
  /** Invalidates in-flight fetch/add when `coverImageUrl` changes (avoids stale preview). */
  const syncGenerationRef = useRef(0);
  const onUploadedRef = useRef(onUploaded);
  onUploadedRef.current = onUploaded;

  useEffect(() => {
    const syncGeneration = ++syncGenerationRef.current;

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

      syncingFromParent.current = true;

      if (u.length === 0) {
        lastSyncedCoverUrl.current = null;
        loadInFlightTarget.current = null;
        pond.removeFiles({ revert: false });
        syncingFromParent.current = false;
        return true;
      }

      loadInFlightTarget.current = target;
      pond.removeFiles({ revert: false });

      const isRemote = u.startsWith("https://") || u.startsWith("http://");

      const finishFail = () => {
        if (syncGeneration !== syncGenerationRef.current) {
          return;
        }
        lastSyncedCoverUrl.current = null;
        loadInFlightTarget.current = null;
        syncingFromParent.current = false;
      };

      const finishOk = () => {
        if (syncGeneration !== syncGenerationRef.current) {
          return;
        }
        lastSyncedCoverUrl.current = target;
        loadInFlightTarget.current = null;
        syncingFromParent.current = false;
      };

      if (!isRemote) {
        void pond
          .addFile(u)
          .then(() => {
            if (syncGeneration !== syncGenerationRef.current) {
              return;
            }
            finishOk();
          })
          .catch(() => {
            if (syncGeneration !== syncGenerationRef.current) {
              return;
            }
            finishFail();
          });
        return true;
      }

      void (async () => {
        try {
          const res = await fetch(u, { mode: "cors" });
          if (syncGeneration !== syncGenerationRef.current) {
            loadInFlightTarget.current = null;
            syncingFromParent.current = false;
            return;
          }
          if (!res.ok) {
            throw new Error(String(res.status));
          }
          const blob = await res.blob();
          if (syncGeneration !== syncGenerationRef.current) {
            loadInFlightTarget.current = null;
            syncingFromParent.current = false;
            return;
          }
          const mime = blob.type || "image/png";
          const name = displayNameFromImageUrl(u);
          const file = new File([blob], name, { type: mime });

          /** `type: 'local'` → FileOrigin.LOCAL so instantUpload does not run server.process (preview only). */
          await pond.addFile(file, { type: "local" });
          if (syncGeneration !== syncGenerationRef.current) {
            pond.removeFiles({ revert: false });
            loadInFlightTarget.current = null;
            syncingFromParent.current = false;
            return;
          }
          finishOk();
        } catch {
          if (syncGeneration !== syncGenerationRef.current) {
            return;
          }
          finishFail();
        }
      })();

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
