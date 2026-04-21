import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { useMemo } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

import { ApiError, apiPostJson } from "@/lib/api-client";

registerPlugin(FilePondPluginFileValidateType);

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export type TripImageFilePondProps = {
  disabled?: boolean;
  onUploaded: (payload: { imageUrl: string; wixMediaFileId: string }) => void;
  onRemove?: () => void;
};

export function TripImageFilePond({
  disabled,
  onUploaded,
  onRemove,
}: TripImageFilePondProps) {
  const server = useMemo(
    () => ({
      process: (
        _fieldName: string,
        file: Blob & { name?: string },
        _metadata: unknown,
        load: (serverId: string) => void,
        error: (message: string) => void,
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
              error(
                typeof b?.message === "string"
                  ? b.message
                  : "Erro ao gerar URL de upload.",
              );
            } else {
              error("Erro ao gerar URL de upload.");
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
                  error("Resposta de upload inválida.");
                  return;
                }
                onUploaded({ imageUrl: url, wixMediaFileId: id });
                load(JSON.stringify({ imageUrl: url, wixMediaFileId: id }));
              } catch {
                error("Resposta de upload inválida.");
              }
            } else {
              error(
                xhr.responseText.slice(0, 500) || `Erro HTTP ${xhr.status}`,
              );
            }
          };
          xhr.onerror = () => error("Falha de rede no upload.");
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
    [onUploaded],
  );

  return (
    <FilePond
      disabled={disabled}
      allowMultiple={false}
      maxFiles={1}
      acceptedFileTypes={ACCEPT}
      labelIdle='Arraste uma imagem ou <span class="filepond--label-action">escolha</span>'
      credits={false}
      server={server}
      onremovefile={() => onRemove?.()}
    />
  );
}
