import { useEffect, useRef, useState } from "react";
import { useApp } from "@/store/AppStore";
import { Modal, Button, Field, Input } from "./ui";
import { BrandLogo, BrandName } from "./Brand";
import { IconUpload, IconTrash, IconShield, IconBuilding } from "./Icons";
import { formatBytes } from "@/lib/utils";

const MAX_LOGO = 1.5 * 1024 * 1024; // 1.5MB

export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { branding, setBranding, notify } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftLogo, setDraftLogo] = useState<string | null>(branding.logoUrl);
  const [name, setName] = useState(branding.brokerName);
  const [tagline, setTagline] = useState(branding.brokerTagline);

  // sincroniza o rascunho ao abrir
  useEffect(() => {
    if (open) {
      setDraftLogo(branding.logoUrl);
      setName(branding.brokerName);
      setTagline(branding.brokerTagline);
    }
  }, [open, branding]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!/image\//.test(file.type)) {
      notify("Selecione um arquivo de imagem.", "error");
      return;
    }
    if (file.size > MAX_LOGO) {
      notify(`Imagem muito grande (máx. ${formatBytes(MAX_LOGO)}).`, "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraftLogo(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setDraftLogo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const save = () => {
    setBranding({
      logoUrl: draftLogo,
      brokerName: name.trim() || "Busa Seguros",
      brokerTagline: tagline.trim() || "Corretora de Seguros",
    });
    notify("Identidade visual atualizada.", "success");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Identidade visual" icon={<IconShield className="h-5 w-5" />}>
      <div className="space-y-5">
        {/* Preview */}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-line-soft bg-surface/50 p-5">
          <BrandLogo size={56} rounded="rounded-2xl" />
          <p className="text-sm font-bold text-white">
            <BrandName />
          </p>
          <p className="text-[11px] text-faint">{tagline || "Corretora · Gestão"}</p>
        </div>

        {/* Upload */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-300">Logo da corretora</p>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface px-4 py-5 text-center transition-colors hover:border-violet-500/40 hover:bg-hover"
          >
            {draftLogo ? (
              <div className="flex items-center gap-3">
                <img
                  src={draftLogo}
                  alt="Pré-visualização"
                  className="h-12 w-12 rounded-lg bg-white/5 object-contain ring-1 ring-white/10 p-1"
                />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200">Logo carregada</p>
                  <p className="text-[11px] text-faint">Clique para trocar · arraste e solte</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10 text-violet-300">
                  <IconUpload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Enviar logo
                  </p>
                  <p className="text-[11px] text-faint">
                    PNG, JPG ou SVG · ideal quadrada · máx. {formatBytes(MAX_LOGO)}
                  </p>
                </div>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          {draftLogo && (
            <button
              onClick={removeLogo}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-300 hover:text-rose-200"
            >
              <IconTrash className="h-3.5 w-3.5" /> Remover logo
            </button>
          )}
        </div>

        {/* Text fields */}
          <Field label="Nome da corretora" hint="Aparece na barra lateral e no painel público.">
          <div className="relative">
            <IconBuilding className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input className="pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da corretora" />
          </div>
        </Field>
        <Field label="Subtítulo / tagline">
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Corretora · Gestão" />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save}>
            <IconUpload className="h-4 w-4" /> Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
