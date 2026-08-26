import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import {
  STATUS_SINISTRO,
  STATUS_SINISTRO_OPTS,
  PARTE_ENVOLVIDA,
} from "@/lib/constants";
import type { Sinistro, StatusSinistro } from "@/lib/types";
import { normalize, formatDate, formatPlaca, formatDateTime } from "@/lib/utils";
import { Button, Input, Select, StatusChip, ConfirmDialog, EmptyState, PageHeader } from "@/components/ui";
import {
  IconPlusCar,
  IconSearch,
  IconEdit,
  IconTrash,
  IconCheck,
  IconCar,
  IconHome,
  IconBuilding,
  IconWrench,
  IconCalendar,
  IconChevronDown,
  IconDoc,
  IconHistory,
} from "@/components/Icons";

const HISTORY_STATUSES: StatusSinistro[] = ["Finalizado", "Cancelado"];

export function Sinistros() {
  const { sinistros, seguradoras, navigate, resolverSinistro, removeSinistro } = useApp();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusSinistro | "all">("all");
  const [segFilter, setSegFilter] = useState("all");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [confirmResolve, setConfirmResolve] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return sinistros
      .filter((s) => !HISTORY_STATUSES.includes(s.status))
      .filter((s) => statusFilter === "all" || s.status === statusFilter)
      .filter((s) => segFilter === "all" || s.seguradoraId === segFilter)
      .filter((s) => {
        if (q.length < 1) return true;
        return normalize(
          `${s.numero} ${s.categoria || "Automóvel"} ${s.clienteNome} ${s.veiculo} ${s.placa} ${s.tipoBem || ""} ${s.naturezaSinistro || ""} ${s.localizacaoSinistro || ""} ${s.seguradoraNome} ${s.oficinaNome} ${s.descricao} ${s.descricaoDanos || ""}`,
        ).includes(q);
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [sinistros, query, statusFilter, segFilter]);

  const history = useMemo(
    () =>
      sinistros
        .filter((s) => HISTORY_STATUSES.includes(s.status))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [sinistros],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sinistros"
        subtitle={`${filtered.length} em andamento · ${history.length} no histórico`}
        icon={<IconCar className="h-5 w-5" />}
        actions={
          <Button onClick={() => navigate("novo-sinistro")}>
            <IconPlusCar className="h-[18px] w-[18px]" /> Novo Sinistro
          </Button>
        }
      />

      <div className="rounded-2xl border border-line-soft bg-card p-3 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              className="pl-9"
              placeholder="Buscar por número, cliente, placa, bem ou localização..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={segFilter} onChange={(e) => setSegFilter(e.target.value)} className="lg:w-56">
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
            Todos
          </FilterChip>
          {STATUS_SINISTRO_OPTS.filter((s) => !HISTORY_STATUSES.includes(s)).map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              dot={STATUS_SINISTRO[s].dot}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_SINISTRO[s].label}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconCar className="w-7 h-7" />}
          title="Nenhum sinistro encontrado"
          description="Ajuste os filtros ou registre um novo sinistro para começar."
          action={
            <Button onClick={() => navigate("novo-sinistro")}>
              <IconPlusCar className="h-4 w-4" /> Novo Sinistro
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <SinistroCard
              key={s.id}
              s={s}
              onEdit={() => navigate("novo-sinistro", { id: s.id })}
              onResolver={() => setConfirmResolve(s.id)}
              onExcluir={() => setConfirmDel(s.id)}
            />
          ))}
        </div>
      )}

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
              <h3 className="text-sm font-bold text-white">Histórico de sinistros</h3>
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
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-faint">
                      <th className="px-3 py-2 font-semibold">Sinistro</th>
                      <th className="px-3 py-2 font-semibold">Cliente</th>
                      <th className="px-3 py-2 font-semibold">Bem / veículo</th>
                      <th className="px-3 py-2 font-semibold">Placa / local</th>
                      <th className="px-3 py-2 font-semibold">Resolvido em</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((s) => (
                      <tr key={s.id} className="border-t border-line-soft hover:bg-hover/50">
                        <td className="px-3 py-2.5 font-semibold text-white">{s.numero}</td>
                        <td className="px-3 py-2.5 text-slate-300">{s.clienteNome}</td>
                         <td className="px-3 py-2.5 text-muted">{s.categoria === "Ramos Elementares" ? s.tipoBem || "Bem segurado" : s.veiculo}</td>
                         <td className="px-3 py-2.5 text-muted">{s.categoria === "Ramos Elementares" ? s.localizacaoSinistro || "—" : formatPlaca(s.placa)}</td>
                        <td className="px-3 py-2.5 text-muted">
                          {s.resolvidoEm ? formatDateTime(s.resolvidoEm) : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusChip
                            label={STATUS_SINISTRO[s.status].label}
                            dot={STATUS_SINISTRO[s.status].dot}
                            chip={STATUS_SINISTRO[s.status].chip}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => navigate("novo-sinistro", { id: s.id })}>
                              Ver
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              title="Excluir sinistro"
                              onClick={() => setConfirmDel(s.id)}
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
        title="Excluir sinistro?"
        message="O registro será removido (exclusão lógica)."
        confirmLabel="Excluir"
        onConfirm={() => confirmDel && removeSinistro(confirmDel)}
        onClose={() => setConfirmDel(null)}
      />
      <ConfirmDialog
        open={confirmResolve !== null}
        title="Resolver sinistro?"
        message="O sinistro será marcado como Finalizado e movido automaticamente para o histórico."
        confirmLabel="Resolver"
        variant="primary"
        onConfirm={() => confirmResolve && resolverSinistro(confirmResolve)}
        onClose={() => setConfirmResolve(null)}
      />
    </div>
  );
}

function SinistroCard({
  s,
  onEdit,
  onResolver,
  onExcluir,
}: {
  s: Sinistro;
  onEdit: () => void;
  onResolver: () => void;
  onExcluir: () => void;
}) {
  const cfg = STATUS_SINISTRO[s.status];
  const parteCfg = PARTE_ENVOLVIDA[s.parteEnvolvida || "segurado"];
  return (
    <div className="group flex flex-col rounded-2xl border border-line-soft bg-card p-4 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-violet-500/25">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-white">{s.numero}</p>
            {s.categoria === "Ramos Elementares" && (
              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                RE
              </span>
            )}
          </div>
          <p className="text-xs text-muted">{s.clienteNome}</p>
        </div>
        <StatusChip label={cfg.label} dot={cfg.dot} chip={cfg.chip} />
      </div>

      {/* Parte envolvida */}
      <div className="mt-2">
        <StatusChip
          label={parteCfg.label}
          dot={parteCfg.dot}
          chip={parteCfg.chip}
        />
      </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface/60 px-3 py-2">
          <span
            className={`grid h-8 w-8 place-items-center rounded-md ${
              s.categoria === "Ramos Elementares"
                ? "bg-violet-500/10 text-violet-300"
                : "bg-amber-500/10 text-amber-300"
            }`}
          >
            {s.categoria === "Ramos Elementares" ? (
              <IconHome className="h-4 w-4" />
            ) : (
              <IconCar className="h-4 w-4" />
            )}
         </span>
         <div className="min-w-0">
           <p className="truncate text-sm font-medium text-slate-200">
             {s.categoria === "Ramos Elementares" ? s.tipoBem || "Bem segurado" : s.veiculo}
           </p>
           <p className="truncate text-[11px] text-faint">
             {s.categoria === "Ramos Elementares"
               ? s.naturezaSinistro || "Ramos Elementares"
               : formatPlaca(s.placa)}
           </p>
         </div>
       </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <span className="flex items-center gap-1.5 text-muted">
          <IconBuilding className="h-3.5 w-3.5 text-faint" /> {s.seguradoraNome || "—"}
        </span>
         <span className="flex items-center gap-1.5 text-muted">
           <IconWrench className="h-3.5 w-3.5 text-faint" />{" "}
           {s.categoria === "Ramos Elementares"
             ? s.localizacaoSinistro || "Local não informado"
             : s.oficinaNome || "—"}
         </span>
        <span className="flex items-center gap-1.5 text-muted">
          <IconCalendar className="h-3.5 w-3.5 text-faint" /> {formatDate(s.data)}
        </span>
      </div>

       {(s.descricaoDanos || s.descricao) && (
         <p className="mt-3 text-sm text-slate-300 line-clamp-2">
           {s.descricaoDanos || s.descricao}
         </p>
       )}

      {s.documentos.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-faint">
          <IconDoc className="h-3.5 w-3.5" /> {s.documentos.length} documento(s)
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 border-t border-line-soft pt-3">
        <Button size="sm" variant="success" className="flex-1" onClick={onResolver}>
          <IconCheck className="h-4 w-4" /> Resolver
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
