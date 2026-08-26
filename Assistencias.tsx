import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { STATUS_ASSISTENCIA, STATUS_ASSISTENCIA_OPTS } from "@/lib/constants";
import type { StatusAssistencia, Assistencia } from "@/lib/types";
import { normalize, formatDate, formatDateTime } from "@/lib/utils";
import { Button, Input, Select, StatusChip, ConfirmDialog, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/ui";
import {
  IconPlusAssist,
  IconSearch,
  IconEdit,
  IconTrash,
  IconCheck,
  IconPhone,
  IconCalendar,
  IconClock,
  IconUser,
  IconListAssist,
  IconChevronDown,
  IconDoc,
  IconHistory,
} from "@/components/Icons";

const ACTIVE_STATUSES: StatusAssistencia[] = ["Em andamento", "Aguardando"];

export function Assistencias() {
  const { assistencias, seguradoras, navigate, concluirAssistencia, removeAssistencia } = useApp();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusAssistencia | "all">("all");
  const [segFilter, setSegFilter] = useState("all");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [confirmDone, setConfirmDone] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return assistencias
      .filter((a) => ACTIVE_STATUSES.includes(a.status))
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .filter((a) => segFilter === "all" || a.seguradoraId === segFilter)
      .filter((a) => {
        if (q.length < 1) return true;
        return normalize(
          `${a.protocolo} ${a.clienteNome} ${a.solicitante} ${a.telefone} ${a.seguradoraNome} ${a.tipo} ${a.assunto} ${a.responsavel}`,
        ).includes(q);
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [assistencias, query, statusFilter, segFilter]);

  const history = useMemo(
    () =>
      assistencias
        .filter((a) => !ACTIVE_STATUSES.includes(a.status))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [assistencias],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assistências"
        subtitle={`${filtered.length} em andamento · ${history.length} no histórico`}
        icon={<IconListAssist className="h-5 w-5" />}
        actions={
          <Button onClick={() => navigate("nova-assistencia")}>
            <IconPlusAssist className="h-[18px] w-[18px]" /> Nova Assistência
          </Button>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border border-line-soft bg-card p-3 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              className="pl-9"
              placeholder="Buscar por protocolo, cliente, tipo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            value={segFilter}
            onChange={(e) => setSegFilter(e.target.value)}
            className="lg:w-56"
          >
            <option value="all">Todas as seguradoras</option>
            {seguradoras.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            Todas
          </FilterChip>
          {STATUS_ASSISTENCIA_OPTS.filter((s) => ACTIVE_STATUSES.includes(s)).map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              dot={STATUS_ASSISTENCIA[s].dot}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_ASSISTENCIA[s].label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconListAssist className="w-7 h-7" />}
          title="Nenhuma assistência encontrada"
          description="Ajuste os filtros ou abra uma nova assistência para começar."
          action={
            <Button onClick={() => navigate("nova-assistencia")}>
              <IconPlusAssist className="h-4 w-4" /> Nova Assistência
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AssistenciaCard
              key={a.id}
              a={a}
              onEdit={() => navigate("nova-assistencia", { id: a.id })}
              onConcluir={() => setConfirmDone(a.id)}
              onExcluir={() => setConfirmDel(a.id)}
            />
          ))}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line-soft bg-card shadow-lg shadow-black/20">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-hover"
          >
            <div className="flex items-center gap-2">
              <span className="text-violet-300">
                <IconHistory className="h-[18px] w-[18px]" />
              </span>
              <h3 className="text-sm font-bold text-white">
                Histórico de assistências
              </h3>
              <span className="rounded-full bg-elevated px-2 py-0.5 text-[11px] font-bold text-muted">
                {history.length}
              </span>
            </div>
            <IconChevronDown
              className={`h-5 w-5 text-faint transition-transform ${historyOpen ? "rotate-180" : ""}`}
            />
          </button>
          {historyOpen && (
            <div className="border-t border-line-soft p-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-faint">
                      <th className="px-3 py-2 font-semibold">Protocolo</th>
                      <th className="px-3 py-2 font-semibold">Cliente</th>
                      <th className="px-3 py-2 font-semibold">Tipo</th>
                      <th className="px-3 py-2 font-semibold">Concluído em</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((a) => (
                      <tr
                        key={a.id}
                        className="border-t border-line-soft hover:bg-hover/50"
                      >
                        <td className="px-3 py-2.5 font-semibold text-white">{a.protocolo}</td>
                        <td className="px-3 py-2.5 text-slate-300">{a.clienteNome}</td>
                        <td className="px-3 py-2.5 text-muted">{a.tipo}</td>
                        <td className="px-3 py-2.5 text-muted">
                          {a.concluidoEm ? formatDateTime(a.concluidoEm) : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusChip
                            label={STATUS_ASSISTENCIA[a.status].label}
                            dot={STATUS_ASSISTENCIA[a.status].dot}
                            chip={STATUS_ASSISTENCIA[a.status].chip}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => navigate("nova-assistencia", { id: a.id })}>
                              Ver
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              title="Excluir assistência"
                              onClick={() => setConfirmDel(a.id)}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDel !== null}
        title="Excluir assistência?"
        message="O registro será removido da lista (exclusão lógica). Esta ação pode ser revertida apenas restaurando os dados."
        confirmLabel="Excluir"
        onConfirm={() => confirmDel && removeAssistencia(confirmDel)}
        onClose={() => setConfirmDel(null)}
      />
      <ConfirmDialog
        open={confirmDone !== null}
        title="Concluir assistência?"
        message="A assistência será marcada como Finalizada e movida automaticamente para o histórico."
        confirmLabel="Concluir"
        variant="primary"
        onConfirm={() => confirmDone && concluirAssistencia(confirmDone)}
        onClose={() => setConfirmDone(null)}
      />
    </div>
  );
}

function AssistenciaCard({
  a,
  onEdit,
  onConcluir,
  onExcluir,
}: {
  a: Assistencia;
  onEdit: () => void;
  onConcluir: () => void;
  onExcluir: () => void;
}) {
  const cfg = STATUS_ASSISTENCIA[a.status];
  return (
    <div className="group flex flex-col rounded-2xl border border-line-soft bg-card p-4 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-violet-500/25">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-white">{a.protocolo}</p>
          <p className="text-xs text-muted">{a.clienteNome}</p>
        </div>
        <StatusChip label={cfg.label} dot={cfg.dot} chip={cfg.chip} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {a.tipo && (
          <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-300 border border-violet-500/20">
            {a.tipo}
          </span>
        )}
        {a.seguradoraNome && (
          <span className="rounded-md bg-elevated px-2 py-0.5 text-[11px] font-medium text-muted border border-line">
            {a.seguradoraNome}
          </span>
        )}
      </div>

      {a.assunto && <p className="mt-3 text-sm text-slate-300 line-clamp-2">{a.assunto}</p>}

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <span className="flex items-center gap-1.5 text-muted">
          <IconPhone className="h-3.5 w-3.5 text-faint" /> {a.telefone || "—"}
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <IconUser className="h-3.5 w-3.5 text-faint" /> {a.responsavel || "—"}
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <IconCalendar className="h-3.5 w-3.5 text-faint" /> {formatDate(a.data)}
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <IconClock className="h-3.5 w-3.5 text-faint" /> {a.horario || "—"}
        </span>
      </div>

      {a.documentos.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-faint">
          <IconDoc className="h-3.5 w-3.5" /> {a.documentos.length} documento(s)
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 border-t border-line-soft pt-3">
        <Button size="sm" variant="success" className="flex-1" onClick={onConcluir}>
          <IconCheck className="h-4 w-4" /> Concluir
        </Button>
        <Button size="sm" variant="secondary" onClick={onEdit} title="Editar">
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="danger" onClick={onExcluir} title="Excluir">
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-violet-500/15 text-violet-200 border border-violet-500/30"
          : "border border-line text-muted hover:bg-hover hover:text-slate-200"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children}
    </button>
  );
}
