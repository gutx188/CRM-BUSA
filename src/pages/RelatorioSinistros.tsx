import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { STATUS_SINISTRO, STATUS_SINISTRO_OPTS } from "@/lib/constants";
import type { StatusSinistro, Sinistro, Cliente } from "@/lib/types";
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
  IconCar,
  IconDoc,
  IconFilter,
  IconRefresh,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconCheckCircle,
  IconClock,
  IconAlert,
  IconChevronDown,
} from "@/components/Icons";

// ---------------------------------------------------------------------------
// Filtros
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
  status: StatusSinistro | "all";
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
  status: "all",
  localizacao: "",
  nomeSegurado: "",
  apolice: "",
  documento: "",
};

function localizacaoDe(s: Sinistro, cliente?: Cliente): string {
  return s.localizacaoSinistro?.trim() || cliente?.endereco?.trim() || "—";
}

/** Extrai "Cidade/UF" de um endereço livre, para agregação por localização. */
function cidadeDe(local: string): string {
  if (!local || local === "—") return "Não informado";
  // padrão comum: "... - São Paulo/SP" ou "..., São Paulo - SP"
  const m = local.match(/[-,]\s*([A-Za-zÀ-ÿ.\s]+?)\s*[/-]\s*([A-Z]{2})\s*$/);
  if (m) return `${m[1].trim()}/${m[2]}`;
  return local.length > 40 ? local.slice(0, 40) + "…" : local;
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export function RelatorioSinistros() {
  const { sinistros, clientes } = useApp();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [incluirFichas, setIncluirFichas] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof Filtros>(key: K, value: Filtros[K]) =>
    setFiltros((f) => ({ ...f, [key]: value }));

  const clienteById = useMemo(() => {
    const m = new Map<string, Cliente>();
    clientes.forEach((c) => m.set(c.id, c));
    return m;
  }, [clientes]);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set<string>();
    sinistros.forEach((s) => {
      const ano = (s.data || s.createdAt || "").slice(0, 4);
      if (ano) anos.add(ano);
    });
    return Array.from(anos).sort((x, y) => y.localeCompare(x));
  }, [sinistros]);

  const filtrados = useMemo(() => {
    const locQ = normalize(filtros.localizacao);
    const nomeQ = normalize(filtros.nomeSegurado);
    const apoliceQ = normalize(filtros.apolice);
    const docQ = filtros.documento.replace(/\D/g, "");

    return sinistros
      .filter((s) => {
        const dataRef = (s.data || s.createdAt || "").slice(0, 10);

        if (filtros.dataInicio && dataRef < filtros.dataInicio) return false;
        if (filtros.dataFim && dataRef > filtros.dataFim) return false;
        if (filtros.ano !== "all" && dataRef.slice(0, 4) !== filtros.ano) return false;
        if (filtros.mes !== "all" && dataRef.slice(5, 7) !== filtros.mes) return false;
        if (filtros.status !== "all" && s.status !== filtros.status) return false;

        const cliente = clienteById.get(s.clienteId);

        if (locQ) {
          const alvo = normalize(
            `${s.localizacaoSinistro ?? ""} ${cliente?.endereco ?? ""}`,
          );
          if (!alvo.includes(locQ)) return false;
        }

        if (nomeQ && !normalize(`${s.clienteNome} ${s.contatoSegurado ?? ""}`).includes(nomeQ))
          return false;

        if (apoliceQ && !normalize(s.numero).includes(apoliceQ)) return false;

        if (docQ) {
          const docCliente = (cliente?.documento ?? "").replace(/\D/g, "");
          if (!docCliente.includes(docQ)) return false;
        }

        return true;
      })
      .sort((a, b) =>
        (b.data || b.createdAt || "").localeCompare(a.data || a.createdAt || ""),
      );
  }, [sinistros, filtros, clienteById]);

  const porStatus = useMemo(() => {
    const r: Record<string, number> = {};
    STATUS_SINISTRO_OPTS.forEach((s) => (r[s] = 0));
    filtrados.forEach((s) => {
      r[s.status] = (r[s.status] ?? 0) + 1;
    });
    return r;
  }, [filtrados]);

  const emCurso =
    (porStatus["Pendente"] ?? 0) +
    (porStatus["Documentação"] ?? 0) +
    (porStatus["Em análise"] ?? 0) +
    (porStatus["Em oficina"] ?? 0);

  const filtrosAtivos = useMemo(() => {
    const chips: string[] = [];
    if (filtros.dataInicio) chips.push(`De ${formatDate(filtros.dataInicio)}`);
    if (filtros.dataFim) chips.push(`Até ${formatDate(filtros.dataFim)}`);
    if (filtros.ano !== "all") chips.push(`Ano ${filtros.ano}`);
    if (filtros.mes !== "all")
      chips.push(MESES.find((m) => m.value === filtros.mes)?.label ?? "");
    if (filtros.status !== "all") chips.push(filtros.status);
    if (filtros.localizacao) chips.push(`Local: ${filtros.localizacao}`);
    if (filtros.nomeSegurado) chips.push(`Segurado: ${filtros.nomeSegurado}`);
    if (filtros.apolice) chips.push(`Apólice: ${filtros.apolice}`);
    if (filtros.documento) chips.push(`Doc: ${filtros.documento}`);
    return chips.filter(Boolean);
  }, [filtros]);

  // -------------------------------------------------------------------------
  // Relatório estruturado (JSON)
  // -------------------------------------------------------------------------
  const relatorioJson = useMemo(() => {
    const porLocalizacao: Record<string, number> = {};
    const porSegurado: Record<string, number> = {};
    filtrados.forEach((s) => {
      const cidade = cidadeDe(localizacaoDe(s, clienteById.get(s.clienteId)));
      porLocalizacao[cidade] = (porLocalizacao[cidade] ?? 0) + 1;
      porSegurado[s.clienteNome] = (porSegurado[s.clienteNome] ?? 0) + 1;
    });

    return {
      report_title: "Relatório de Sinistros de Seguros",
      generated_at: new Date().toISOString(),
      filters_applied: {
        period: {
          start_date: filtros.dataInicio || null,
          end_date: filtros.dataFim || null,
          year: filtros.ano !== "all" ? filtros.ano : null,
          month: filtros.mes !== "all" ? filtros.mes : null,
        },
        status: filtros.status !== "all" ? [filtros.status] : null,
        location: filtros.localizacao || null,
        insured_information: {
          name: filtros.nomeSegurado || null,
          policy_number: filtros.apolice || null,
          cpf_cnpj: filtros.documento || null,
        },
      },
      total_de_sinistros: filtrados.length,
      sinistros_por_status: porStatus,
      sinistros_por_localizacao: porLocalizacao,
      sinistros_por_segurado: porSegurado,
      sinistros: filtrados.map((s) => {
        const cliente = clienteById.get(s.clienteId);
        return {
          numero: s.numero,
          data: (s.data || s.createdAt || "").slice(0, 10),
          status: s.status,
          segurado: s.clienteNome,
          cpf_cnpj: cliente?.documento ?? null,
          veiculo: s.veiculo || null,
          placa: s.placa || null,
          seguradora: s.seguradoraNome,
          localizacao: localizacaoDe(s, cliente),
        };
      }),
    };
  }, [filtrados, filtros, porStatus, clienteById]);

  const jsonTexto = useMemo(
    () => JSON.stringify(relatorioJson, null, 2),
    [relatorioJson],
  );

  const copiarJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonTexto);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard indisponível */
    }
  };

  const baixarJson = () => {
    const blob = new Blob([jsonTexto], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-sinistros-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportarPdf = async () => {
    setPdfBusy(true);
    try {
      const { gerarPdfSinistros } = await import("@/lib/report-pdf");
      await gerarPdfSinistros(filtrados, clienteById, filtrosAtivos, porStatus, incluirFichas);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Relatório de Sinistros"
        subtitle="Resumo consolidado, filtros e exportação em PDF/JSON"
        icon={<IconCar className="h-5 w-5" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setFiltros(FILTROS_INICIAIS)}>
              <IconRefresh className="h-4 w-4" /> Limpar filtros
            </Button>
            <Button variant="ghost" onClick={() => setJsonOpen((v) => !v)}>
              {"{ }"} JSON
            </Button>
            <Button onClick={exportarPdf} disabled={pdfBusy || filtrados.length === 0}>
              <IconDoc className="h-4 w-4" />
              {pdfBusy ? "Gerando PDF..." : "Exportar PDF"}
            </Button>
          </div>
        }
      />

      {/* Resumo geral */}
      <section id="rel-sin-resumo" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ResumoCard
          icon={<IconCar className="h-5 w-5" />}
          label="Total encontrado"
          value={filtrados.length}
          hint={`de ${sinistros.length} sinistros registrados`}
          accent="text-brand2"
        />
        <ResumoCard
          icon={<IconClock className="h-5 w-5" />}
          label="Em curso"
          value={emCurso}
          hint="Pendente · Documentação · Em análise · Em oficina"
          accent="text-sky-300"
        />
        <ResumoCard
          icon={<IconCheckCircle className="h-5 w-5" />}
          label="Finalizados"
          value={porStatus["Finalizado"] ?? 0}
          accent="text-emerald-300"
        />
        <ResumoCard
          icon={<IconAlert className="h-5 w-5" />}
          label="Cancelados"
          value={porStatus["Cancelado"] ?? 0}
          accent="text-rose-300"
        />
      </section>

      {/* Filtros */}
      <section
        id="rel-sin-filtros"
        className="rounded-2xl border border-line-soft bg-card p-4 shadow-lg shadow-black/20"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <IconFilter className="h-4 w-4 text-violet-300" />
          Filtros
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

          <Field label="Estado do sinistro">
            <Select
              value={filtros.status}
              onChange={(e) => set("status", e.target.value as Filtros["status"])}
            >
              <option value="all">Todos os status</option>
              {STATUS_SINISTRO_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Localização (cidade, estado, CEP)">
            <Input
              placeholder="Ex: São Paulo, SP, 01310-100"
              value={filtros.localizacao}
              onChange={(e) => set("localizacao", e.target.value)}
            />
          </Field>

          <Field label="Nome do segurado">
            <Input
              placeholder="Nome do cliente"
              value={filtros.nomeSegurado}
              onChange={(e) => set("nomeSegurado", e.target.value)}
            />
          </Field>
          <Field label="Nº da apólice / sinistro">
            <Input
              placeholder="Ex: SIN-2026-0001"
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

          <Field label="Opções do PDF">
            <label className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-line-soft bg-elevated px-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={incluirFichas}
                onChange={(e) => setIncluirFichas(e.target.checked)}
                className="h-4 w-4 accent-[#1ba3e0]"
              />
              Incluir ficha individual por sinistro
            </label>
          </Field>
        </div>

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

      {/* Saída JSON */}
      <section
        id="rel-sin-json"
        className="overflow-hidden rounded-2xl border border-line-soft bg-card shadow-lg shadow-black/20"
      >
        <button
          onClick={() => setJsonOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-hover"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-violet-300">{"{ }"}</span>
            <h3 className="text-sm font-bold text-white">Relatório estruturado (JSON)</h3>
          </div>
          <IconChevronDown
            className={`h-5 w-5 text-faint transition-transform ${jsonOpen ? "rotate-180" : ""}`}
          />
        </button>
        {jsonOpen && (
          <div className="border-t border-line-soft">
            <div className="flex flex-wrap gap-2 px-5 py-3">
              <Button variant="ghost" size="sm" onClick={copiarJson}>
                {copied ? "✓ Copiado!" : "Copiar JSON"}
              </Button>
              <Button variant="ghost" size="sm" onClick={baixarJson}>
                Baixar .json
              </Button>
            </div>
            <pre className="max-h-96 overflow-auto border-t border-line-soft bg-bg/60 px-5 py-4 font-mono text-[11px] leading-relaxed text-emerald-200">
              {jsonTexto}
            </pre>
          </div>
        )}
      </section>

      {/* Resultado */}
      <section
        id="rel-sin-resultado"
        className="overflow-hidden rounded-2xl border border-line-soft bg-card shadow-lg shadow-black/20"
      >
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-bold text-white">Sinistros encontrados</h3>
          <span className="rounded-full bg-elevated px-2.5 py-0.5 text-[11px] font-bold text-muted">
            {filtrados.length} {filtrados.length === 1 ? "registro" : "registros"}
          </span>
        </header>

        {filtrados.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<IconCar className="h-7 w-7" />}
              title="Nenhum sinistro encontrado"
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
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-faint">
                  <th className="px-4 py-3 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <IconCalendar className="h-3.5 w-3.5" /> Data
                    </span>
                  </th>
                  <th className="px-4 py-3 font-semibold">Nº Sinistro</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Veículo / Placa</th>
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
                {filtrados.map((s) => {
                  const cfg = STATUS_SINISTRO[s.status];
                  const local = localizacaoDe(s, clienteById.get(s.clienteId));
                  return (
                    <tr
                      key={s.id}
                      className="border-t border-line-soft transition-colors hover:bg-hover/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                        {formatDate(s.data || s.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">
                        {s.numero}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip label={cfg.label} dot={cfg.dot} chip={cfg.chip} />
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {s.veiculo}
                        {s.placa ? (
                          <span className="ml-1.5 font-mono text-xs text-muted">{s.placa}</span>
                        ) : null}
                      </td>
                      <td className="max-w-[260px] truncate px-4 py-3 text-muted" title={local}>
                        {local}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{s.clienteNome}</td>
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
