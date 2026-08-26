import { useEffect } from "react";
import { useApp } from "@/store/AppStore";
import { isPocketBasePrepared } from "@/lib/pocketbase";
import { Modal, Button } from "./ui";
import { IconCloud, IconCheck, IconAlert } from "./Icons";
import { formatDateTime } from "@/lib/utils";

export function SyncSettings({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    cloudEnabled,
    syncStatus,
    cloudWorkspace,
    lastSyncedAt,
    disconnectCloud,
  } = useApp();

  useEffect(() => {
    // Garante que o modal reaja corretamente quando for aberto após uma
    // mudança de ambiente, sem manter estado de formulário obsoleto.
  }, [open]);

  const prepared = isPocketBasePrepared();
  const statusLabel = {
    off: { t: "Modo local", c: "text-slate-400 bg-elevated border-line" },
    syncing: {
      t: "Sincronizando...",
      c: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    },
    live: {
      t: "Sincronização ativa",
      c: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    },
    error: {
      t: "Erro de sincronização",
      c: "text-rose-300 bg-rose-500/10 border-rose-500/25",
    },
  }[syncStatus];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Persistência dos dados"
      icon={<IconCloud className="h-5 w-5" />}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line-soft bg-surface/50 p-4">
          <div className="flex items-center gap-3">
            <span
              className={`relative grid h-10 w-10 place-items-center rounded-lg border ${statusLabel.c}`}
            >
              <IconCloud className="h-5 w-5" />
              {syncStatus === "syncing" && (
                <span className="absolute inset-0 animate-ping rounded-lg border border-amber-400/40" />
              )}
            </span>
            <div>
              <p className="text-sm font-bold text-white">{statusLabel.t}</p>
              <p className="text-[11px] text-faint">
                {cloudEnabled && cloudWorkspace
                  ? `Workspace: ${cloudWorkspace}`
                  : "Dados salvos apenas neste navegador"}
              </p>
            </div>
          </div>
          {cloudEnabled && lastSyncedAt && (
            <p className="hidden text-right text-[11px] text-faint sm:block">
              Última sincronização
              <br />
              {formatDateTime(lastSyncedAt)}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-1.5 font-semibold text-violet-200">
              <IconCheck className="h-4 w-4" /> PocketBase preparado
            </p>
            <p className="mt-2 leading-relaxed text-muted">
              O adaptador REST e a estrutura da coleção já estão no projeto,
              mas a sincronização permanece desligada por segurança.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-200/90">
            <p className="flex items-start gap-1.5 font-semibold">
              <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Acesso público exige revisão de segurança
            </p>
            <p className="mt-1 pl-5">
              Como o CRM não exige login, liberar escrita anônima no PocketBase
              permitiria que qualquer pessoa alterasse os dados. A ativação
              deve acontecer somente após configurar regras ou um proxy seguro.
            </p>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            {prepared
              ? "A URL do PocketBase foi preparada no ambiente, porém nenhum dado é enviado enquanto a flag de sincronização permanecer desativada."
              : "Quando a infraestrutura estiver pronta, informe a URL por ambiente e revise as regras da coleção crm_workspaces."}
          </p>

          <div className="flex justify-end gap-2 pt-1">
            {cloudEnabled && (
              <Button
                variant="danger"
                onClick={() => {
                  disconnectCloud();
                  onClose();
                }}
              >
                Desativar sincronização
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}