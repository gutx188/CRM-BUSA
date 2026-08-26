import { useApp } from "@/store/AppStore";
import { StatCard, SectionCard } from "@/components/shared";
import { Button, StatusChip } from "@/components/ui";
import {
  STATUS_ASSISTENCIA,
  STATUS_ASSISTENCIA_OPTS,
  STATUS_SINISTRO,
  STATUS_SINISTRO_OPTS,
} from "@/lib/constants";
import { tempoRelativo, formatPlaca } from "@/lib/utils";
import {
  IconPlusAssist,
  IconPlusCar,
  IconListAssist,
  IconCar,
  IconHome,
  IconCheckCircle,
  IconChevronRight,
  IconLayers,
  IconClock,
  IconAlert,
} from "@/components/Icons";
import type { StatusAssistencia, StatusSinistro } from "@/lib/types";

export function Dashboard() {
  const { assistencias, sinistros, navigate } = useApp();

  const countA = (s: StatusAssistencia) =>
    assistencias.filter((a) => a.status === s).length;
  const countS = (s: StatusSinistro) =>
    sinistros.filter((s2) => s2.status === s).length;

  const assistAtivas = assistencias.filter(
    (a) => a.status === "Em andamento" || a.status === "Aguardando",
  ).length;
  const sinistrosAtivos = sinistros.filter(
    (s) => !["Finalizado", "Cancelado"].includes(s.status),
  ).length;
  const totalConcluidos =
    countA("Finalizado") + countS("Finalizado");
  const cancelados = countA("Cancelado") + countS("Cancelado");

  const recentAssist = [...assistencias]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);
  const recentSin = [...sinistros]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);

  const maxA = Math.max(1, ...STATUS_ASSISTENCIA_OPTS.map(countA));
  const maxS = Math.max(1, ...STATUS_SINISTRO_OPTS.map(countS));

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-line-soft bg-gradient-to-br from-violet-600/20 via-card to-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
              {today}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Operação Busa em um só lugar
            </h1>
            <p className="mt-1 text-sm text-muted">
              Você tem{" "}
              <span className="font-semibold text-sky-300">{assistAtivas}</span>{" "}
              assistências e{" "}
              <span className="font-semibold text-amber-300">
                {sinistrosAtivos}
              </span>{" "}
              sinistros em andamento.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("nova-assistencia")}>
              <IconPlusAssist className="h-[18px] w-[18px]" /> Assistência
            </Button>
            <Button onClick={() => navigate("novo-sinistro")}>
              <IconPlusCar className="h-[18px] w-[18px]" /> Sinistro
            </Button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Assistências ativas"
          value={assistAtivas}
          sub={`${countA("Em andamento")} em andamento · ${countA("Aguardando")} aguardando`}
          accent="sky"
          icon={<IconListAssist className="h-5 w-5" />}
          onClick={() => navigate("assistencias")}
        />
        <StatCard
          label="Sinistros ativos"
          value={sinistrosAtivos}
          sub={`${countS("Pendente")} pendentes · ${countS("Em análise")} em análise`}
          accent="amber"
          icon={<IconCar className="h-5 w-5" />}
          onClick={() => navigate("sinistros")}
        />
        <StatCard
          label="Concluídos / Resolvidos"
          value={totalConcluidos}
          sub={`${countA("Finalizado")} assist. · ${countS("Finalizado")} sinistros`}
          accent="emerald"
          icon={<IconCheckCircle className="h-5 w-5" />}
        />
        <StatCard
          label="Cancelados"
          value={cancelados}
          sub={`${countA("Cancelado")} assist. · ${countS("Cancelado")} sinistros`}
          accent="rose"
          icon={<IconAlert className="h-5 w-5" />}
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            title="Assistências recentes"
            icon={<IconListAssist className="h-[18px] w-[18px]" />}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("assistencias")}>
                Ver todas <IconChevronRight className="h-4 w-4" />
              </Button>
            }
          >
            <div className="space-y-2">
              {recentAssist.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate("nova-assistencia", { id: a.id })}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-surface/50 px-3 py-2.5 text-left transition-colors hover:border-line hover:bg-hover"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-300">
                    <IconListAssist className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {a.protocolo}
                      </p>
                      <StatusChip
                        label={STATUS_ASSISTENCIA[a.status].label}
                        dot={STATUS_ASSISTENCIA[a.status].dot}
                        chip={STATUS_ASSISTENCIA[a.status].chip}
                      />
                    </div>
                    <p className="truncate text-xs text-muted">
                      {a.clienteNome} · {a.tipo}
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-[11px] text-faint sm:block">
                    {tempoRelativo(a.updatedAt)}
                  </span>
                </button>
              ))}
              {recentAssist.length === 0 && (
                <p className="py-6 text-center text-sm text-faint">
                  Nenhuma assistência registrada.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Sinistros recentes"
            icon={<IconCar className="h-[18px] w-[18px]" />}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("sinistros")}>
                Ver todos <IconChevronRight className="h-4 w-4" />
              </Button>
            }
          >
            <div className="space-y-2">
              {recentSin.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate("novo-sinistro", { id: s.id })}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-surface/50 px-3 py-2.5 text-left transition-colors hover:border-line hover:bg-hover"
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
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
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {s.numero}
                      </p>
                      <StatusChip
                        label={STATUS_SINISTRO[s.status].label}
                        dot={STATUS_SINISTRO[s.status].dot}
                        chip={STATUS_SINISTRO[s.status].chip}
                      />
                    </div>
                    <p className="truncate text-xs text-muted">
                      {s.clienteNome} ·{" "}
                      {s.categoria === "Ramos Elementares"
                        ? `${s.tipoBem || "Bem segurado"} · ${s.naturezaSinistro || "RE"}`
                        : `${formatPlaca(s.placa)} · ${s.veiculo}`}
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-[11px] text-faint sm:block">
                    {tempoRelativo(s.updatedAt)}
                  </span>
                </button>
              ))}
              {recentSin.length === 0 && (
                <p className="py-6 text-center text-sm text-faint">
                  Nenhum sinistro registrado.
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Distribution */}
        <div className="space-y-4">
          <SectionCard
            title="Distribuição"
            icon={<IconLayers className="h-[18px] w-[18px]" />}
          >
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                  Assistências
                </p>
                <div className="space-y-2">
                  {STATUS_ASSISTENCIA_OPTS.map((st) => {
                    const c = countA(st);
                    const cfg = STATUS_ASSISTENCIA[st];
                    return (
                      <div key={st} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-slate-300">
                          {cfg.label}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                          <div
                            className={`h-full rounded-full ${cfg.dot}`}
                            style={{ width: `${(c / maxA) * 100}%` }}
                          />
                        </div>
                        <span className="w-5 shrink-0 text-right text-xs font-bold text-slate-200 tabular-nums">
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                  Sinistros
                </p>
                <div className="space-y-2">
                  {STATUS_SINISTRO_OPTS.map((st) => {
                    const c = countS(st);
                    const cfg = STATUS_SINISTRO[st];
                    return (
                      <div key={st} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-slate-300">
                          {cfg.label}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                          <div
                            className={`h-full rounded-full ${cfg.dot}`}
                            style={{ width: `${(c / maxS) * 100}%` }}
                          />
                        </div>
                        <span className="w-5 shrink-0 text-right text-xs font-bold text-slate-200 tabular-nums">
                          {c}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Resumo geral" icon={<IconClock className="h-[18px] w-[18px]" />}>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat icon={<IconListAssist className="h-4 w-4" />} label="Assistências" value={assistencias.length} />
              <MiniStat icon={<IconCar className="h-4 w-4" />} label="Sinistros" value={sinistros.length} />
              <MiniStat icon={<IconCheckCircle className="h-4 w-4" />} label="Concluídos" value={totalConcluidos} />
              <MiniStat icon={<IconAlert className="h-4 w-4" />} label="Cancelados" value={cancelados} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-line-soft bg-surface/50 p-3">
      <div className="flex items-center gap-2 text-faint">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-2xl font-extrabold text-white tabular-nums">{value}</p>
    </div>
  );
}
