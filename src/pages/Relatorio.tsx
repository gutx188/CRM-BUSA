import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import {
  STATUS_ASSISTENCIA,
  STATUS_ASSISTENCIA_OPTS,
  TIPOS_ASSISTENCIA,
} from "@/lib/constants";
import type { StatusAssistencia, Assistencia, Cliente } from "@/lib/types";
import { normalize, formatDate } from "@/lib/utils";
import {
  Button,
  Input,
  Select,
  StatusChip,
  EmptyState,
  PageHeader,
  Field,
} from "@/components/ui";
import {
  IconDoc,
  IconFilter,
  IconListAssist,
  IconRefresh,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconCheckCircle,
  IconClock,
  IconAlert,
} from "@/components/Icons";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MESES = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

interface Filtros {
  dataInicio: string;
  dataFim: string;
  ano: string;
  mes: string;
  tipo: string;
  status: StatusAssistencia | "all";
  localizacao: string;
  nomeSegurado: string;
  apolice: string;
  documento: string;
}

const FILTROS_INICIAIS: Filtros = {
  dataInicio: "",
  dataFim: "",
  ano: "all",
  mes: "all",
  tipo: "all",
  status: "all",
  localizacao: "",
  nomeSegurado: "",
  apolice: "",
  documento: "",
};

/** Localização exibida na tabela: origem → destino da assistência. */
function localizacaoDe(a: Assistencia): string {
  const origem = a.origem?.trim();
  const destino = a.destino?.trim();
  if (origem && destino && destino !== "—") return `${origem} → ${destino}`;
  return origem || destino || "—";
}

/** Texto pesquisável de localização: origem, destino e endereço do cliente. */
function localizacaoBusca(a: Assistencia, cliente?: Cliente): string {
  return normalize(
    `${a.origem ?? ""} ${a.destino ?? ""} ${cliente?.endereco ?? ""}`,
  );
}

function csvEscape(v: string): string {
  if (/[";\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export function Relatorio() {
  const { assistencias, clientes } = useApp();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);

  const set = <K extends keyof Filtros>(key: K, value: Filtros[K]) =>
    setFiltros((f) => ({ ...f, [key]: value }));

  const clienteById = useMemo(() => {
    const m = new Map<string, Cliente>();
    clientes.forEach((c) => m.set(c.id, c));
    return m;
  }, [clientes]);

  // Anos disponíveis nos dados
  const anosDisponiveis = useMemo(() => {
    const anos = new Set<string>();
    assistencias.forEach((a) => {
      const ano = (a.data || a.createdAt || "").slice(0, 4);
      if (ano) anos.add(ano);
    });
    return Array.from(anos).sort((x, y) => y.localeCompare(x));
  }, [assistencias]);

  // Tipos presentes nos dados + tipos padrão
  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set<string>(TIPOS_ASSISTENCIA);
    assistencias.forEach((a) => a.tipo && tipos.add(a.tipo));
    return Array.from(tipos).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [assistencias]);

  const filtradas = useMemo(() => {
    const locQ = normalize(filtros.localizacao);
    const nomeQ = normalize(filtros.nomeSegurado);
    const apoliceQ = normalize(filtros.apolice);
    const docQ = filtros.documento.replace(/\D/g, "");

    return assistencias
      .filter((a) => {
        const dataRef = (a.data || a.createdAt || "").slice(0, 10);

        // Período: data início / fim
        if (filtros.dataInicio && dataRef < filtros.dataInicio) return false;
        if (filtros.dataFim && dataRef > filtros.dataFim) return false;

        // Ano / mês
        if (filtros.ano !== "all" && dataRef.slice(0, 4) !== filtros.ano)
          return false;
        if (filtros.mes !== "all" && dataRef.slice(5, 7) !== filtros.mes)
          return false;

        // Tipo de assistência
        if (filtros.tipo !== "all" && a.tipo !== filtros.tipo) return false;

        // Status
        if (filtros.status !== "all" && a.status !== filtros.status)
          return false;

        const cliente = clienteById.get(a.clienteId);

        // Localização (cidade, estado, CEP — busca em origem/destino/endereço)
        if (locQ && !localizacaoBusca(a, cliente).includes(locQ)) return false;

        // Nome do segurado
        if (
          nomeQ &&
          !normalize(`${a.clienteNome} ${a.solicitante}`).includes(nomeQ)
        )
          return false;

        // Número da apólice / protocolo
        if (apoliceQ && !normalize(a.protocolo).includes(apoliceQ))
          return false;

        // CPF/CNPJ
        if (docQ) {
          const docCliente = (cliente?.documento ?? "").replace(/\D/g, "");
          if (!docCliente.includes(docQ)) return false;
        }

        return true;
      })
      .sort((a, b) =>
        (b.data || b.createdAt || "").localeCompare(a.data || a.createdAt || ""),
      );
  }, [assistencias, filtros, clienteById]);

  // Resumo por status (do conjunto filtrado)
  const resumo = useMemo(() => {
    const porStatus: Record<string, number> = {};
    filtradas.forEach((a) => {
      porStatus[a.status] = (porStatus[a.status] ?? 0) + 1;
    });
    return porStatus;
  }, [filtradas]);

  const filtrosAtivos = useMemo(() => {
    const chips: string[] = [];
    if (filtros.dataInicio) chips.push(`De ${formatDate(filtros.dataInicio)}`);
    if (filtros.dataFim) chips.push(`Até ${formatDate(filtros.dataFim)}`);
    if (filtros.ano !== "all") chips.push(`Ano ${filtros.ano}`);
    if (filtros.mes !== "all")
      chips.push(MESES.find((m) => m.value === filtros.mes)?.label ?? "");
    if (filtros.tipo !== "all") chips.push(filtros.tipo);
    if (filtros.status !== "all") chips.push(filtros.status);
    if (filtros.localizacao) chips.push(`Local: ${filtros.localizacao}`);
    if (filtros.nomeSegurado) chips.push(`Segurado: ${filtros.nomeSegurado}`);
    if (filtros.apolice) chips.push(`Apólice: ${filtros.apolice}`);
    if (filtros.documento) chips.push(`Doc: ${filtros.documento}`);
    return chips.filter(Boolean);
  }, [filtros]);

  const exportarCsv = () => {
    const header = [
      "Data da Assistência",
      "Protocolo",
      "Tipo de Assistência",
      "Status",
      "Localização",
      "Nome do Segurado",
      "CPF/CNPJ",
      "Seguradora",
      "Responsável",
    ];
    const rows = filtradas.map((a) => {
      const cliente = clienteById.get(a.clienteId);
      return [
        formatDate(a.data || a.createdAt),
        a.protocolo,
        a.tipo,
        a.status,
        localizacaoDe(a),
        a.clienteNome,
        cliente?.documento ?? "",
        a.seguradoraNome,
        a.responsavel,
      ]
        .map(csvEscape)
        .join(";");
    });
    const csv = "\uFEFF" + [header.join(";"), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-assistencias-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Relatório de Assistências"
        subtitle="Resumo geral com filtros por período, tipo, status, localização e segurado"
        icon={<IconDoc className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setFiltros(FILTROS_INICIAIS)}>
              <IconRefresh className="h-4 w-4" /> Limpar filtros
            </Button>
            <Button onClick={exportarCsv} disabled={filtradas.length === 0}>
              <IconDoc className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        }
      />

      {/* Resumo geral */}
      <section
        id="relatorio-resumo"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <ResumoCard
          icon={<IconListAssist className="h-5 w-5" />}
          label="Total encontrado"
          value={filtradas.length}
          hint={`de ${assistencias.length} assistências registradas`}
          accent="text-brand2"
        />
        <ResumoCard
          icon={<IconClock className="h-5 w-5" />}
          label="Em andamento / Aguardando"
          value={(resumo["Em andamento"] ?? 0) + (resumo["Aguardando"] ?? 0)}
          accent="text-sky-300"
        />
        <ResumoCard
          icon={<IconCheckCircle className="h-5 w-5" />}
          label="Finalizadas"
          value={resumo["Finalizado"] ?? 0}
          accent="text-emerald-300"
        />
        <ResumoCard
          icon={<IconAlert className="h-5 w-5" />}
          label="Canceladas"
          value={resumo["Cancelado"] ?? 0}
          accent="text-rose-300"
        />
      </section>

      {/* Filtros */}
      <section
        id="relatorio-filtros"
        className="rounded-2xl border border-line-soft bg-card p-4 shadow-lg shadow-black/20"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <IconFilter className="h-4 w-4 text-violet-300" />
          Filtros
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {/* Período */}
          <Field label="Data de início">
            <Input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </Field>
          <Field label="Data de fim">
            <Input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => set("dataFim", e.target.value)}
            />
          </Field>
          <Field label="Ano">
            <Select value={filtros.ano} onChange={(e) => set("ano", e.target.value)}>
              <option value="all">Todos os anos</option>
              {anosDisponiveis.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mês">
            <Select value={filtros.mes} onChange={(e) => set("mes", e.target.value)}>
              <option value="all">Todos os meses</option>
              {MESES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>

          {/* Tipo e status */}
          <Field label="Tipo de assistência">
            <Select value={filtros.tipo} onChange={(e) => set("tipo", e.target.value)}>
              <option value="all">Todos os tipos</option>
              {tiposDisponiveis.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={filtros.status}
              onChange={(e) => set("status", e.target.value as Filtros["status"])}
            >
              <option value="all">Todos os status</option>
              {STATUS_ASSISTENCIA_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          {/* Localização */}
          <Field label="Localização (cidade, estado, CEP)">
            <Input
              placeholder="Ex: São Paulo, SP, 01310-100"
              value={filtros.localizacao}
              onChange={(e) => set("localizacao", e.target.value)}
            />
          </Field>

          {/* Segurado */}
          <Field label="Nome do segurado">
            <Input
              placeholder="Nome do cliente ou solicitante"
              value={filtros.nomeSegurado}
              onChange={(e) => set("nomeSegurado", e.target.value)}
            />
          </Field>
          <Field label="Nº da apólice / protocolo">
            <Input
              placeholder="Ex: AST-2026-0001"
              value={filtros.apolice}
              onChange={(e) => set("apolice", e.target.value)}
            />
          </Field>
          <Field label="CPF / CNPJ">
            <Input
              placeholder="Somente números ou formatado"
              value={filtros.documento}
              onChange={(e) => set("documento", e.target.value)}
            />
          </Field>
        </div>

        {/* Chips dos filtros aplicados */}
        {filtrosAtivos.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line-soft pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
              Filtros aplicados:
            </span>
            {filtrosAtivos.map((c) => (
              <span
                key={c}
                className="rounded-full border border-brand/30 bg-brand/15 px-2.5 py-0.5 text-[11px] font-semibold text-violet-200"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Resultado */}
      <section
        id="relatorio-resultado"
        className="overflow-hidden rounded-2xl border border-line-soft bg-card shadow-lg shadow-black/20"
      >
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-bold text-white">
            Assistências encontradas
          </h3>
          <span className="rounded-full bg-elevated px-2.5 py-0.5 text-[11px] font-bold text-muted">
            {filtradas.length} {filtradas.length === 1 ? "registro" : "registros"}
          </span>
        </header>

        {filtradas.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<IconListAssist className="h-7 w-7" />}
              title="Nenhuma assistência encontrada"
              description="Ajuste ou limpe os filtros para ver mais resultados."
              action={
                <Button variant="ghost" onClick={() => setFiltros(FILTROS_INICIAIS)}>
                  <IconRefresh className="h-4 w-4" /> Limpar filtros
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-faint">
                  <th className="px-4 py-3 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <IconCalendar className="h-3.5 w-3.5" /> Data
                    </span>
                  </th>
                  <th className="px-4 py-3 font-semibold">Protocolo</th>
                  <th className="px-4 py-3 font-semibold">Tipo de Assistência</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <IconMapPin className="h-3.5 w-3.5" /> Localização
                    </span>
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <IconUser className="h-3.5 w-3.5" /> Segurado
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((a) => {
                  const cfg = STATUS_ASSISTENCIA[a.status];
                  return (
                    <tr
                      key={a.id}
                      className="border-t border-line-soft transition-colors hover:bg-hover/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                        {formatDate(a.data || a.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">
                        {a.protocolo}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{a.tipo}</td>
                      <td className="px-4 py-3">
                        <StatusChip label={cfg.label} dot={cfg.dot} chip={cfg.chip} />
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-muted" title={localizacaoDe(a)}>
                        {localizacaoDe(a)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{a.clienteNome}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

function ResumoCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-line-soft bg-card p-4 shadow-lg shadow-black/20">
      <div className={`mb-2 inline-flex ${accent}`}>{icon}</div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-faint">{hint}</p>}
    </article>
  );
}
