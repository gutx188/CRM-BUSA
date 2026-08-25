import { useRef, useState } from "react";
import type { Documento } from "@/lib/types";
import { formatBytes, uid, nowISO } from "@/lib/utils";
import { Button } from "./ui";
import { IconDoc, IconTrash, IconUpload } from "./Icons";

const MAX_FILE = 2 * 1024 * 1024; // 2MB per file (localStorage friendly)

export function DocumentUpload({
  documentos,
  onChange,
  notify,
}: {
  documentos: Documento[];
  onChange: (docs: Documento[]) => void;
  notify?: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted: Documento[] = [];
    let rejected = 0;
    const promises: Promise<void>[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE) {
        rejected++;
        return;
      }
      promises.push(
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            accepted.push({
              id: uid("doc-"),
              nome: file.name,
              tipo: file.type || "arquivo",
              tamanho: file.size,
              dataUrl: String(reader.result || ""),
              uploadedAt: nowISO(),
            });
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(file);
        }),
      );
    });
    Promise.all(promises).then(() => {
      if (accepted.length) {
        onChange([...documentos, ...accepted]);
        notify?.(`${accepted.length} documento(s) anexado(s).`, "success");
      }
      if (rejected > 0) {
        notify?.(
          `${rejected} arquivo(s) ignorado(s) (acima de ${formatBytes(MAX_FILE)}).`,
          "error",
        );
      }
    });
  };

  const removeDoc = (id: string) => {
    onChange(documentos.filter((d) => d.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
          drag
            ? "border-violet-500/60 bg-violet-500/5"
            : "border-line bg-surface hover:border-violet-500/40 hover:bg-hover"
        }`}
      >
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10 text-violet-300">
          <IconUpload className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">
            Arraste arquivos ou clique para anexar
          </p>
          <p className="text-[11px] text-faint">
            PDF, imagens e documentos · máx. {formatBytes(MAX_FILE)} por arquivo
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {documentos.length > 0 && (
        <div className="flex flex-col gap-2">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-line-soft bg-surface px-3 py-2"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-elevated text-violet-300">
                <IconDoc className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {doc.nome}
                </p>
                <p className="text-[11px] text-faint">{formatBytes(doc.tamanho)}</p>
              </div>
              <a
                href={doc.dataUrl}
                download={doc.nome}
                className="rounded-md px-2 py-1 text-[11px] font-semibold text-violet-300 hover:bg-hover"
              >
                Baixar
              </a>
              <button
                onClick={() => removeDoc(doc.id)}
                className="grid h-7 w-7 place-items-center rounded-md text-faint hover:bg-rose-500/10 hover:text-rose-400"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {documentos.length === 0 && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => inputRef.current?.click()}
        >
          <IconUpload className="w-4 h-4" /> Selecionar arquivos
        </Button>
      )}
    </div>
  );
}
