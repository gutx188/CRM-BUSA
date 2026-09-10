import { jsPDF } from "jspdf";
import type { Assistencia, Sinistro, Cliente } from "./types";
import { formatDate, formatDateTime } from "./utils";

// ---------------------------------------------------------------------------
// Paleta do documento (visual limpo do timbrado Busa)
// ---------------------------------------------------------------------------
const NAVY: [number, number, number] = [16, 42, 67]; // wordmark "Busa"
const BLUE: [number, number, number] = [23, 116, 199]; // títulos de seção
const CYAN: [number, number, number] = [41, 182, 240]; // sublinhado do título
const TEXT_DARK: [number, number, number] = [45, 55, 72];
const TEXT_LABEL: [number, number, number] = [74, 85, 104];
const TEXT_MUTED: [number, number, number] = [113, 128, 150];
const LINE: [number, number, number] = [222, 228, 236];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;
const VALUE_X = MARGIN + 58; // coluna dos valores nas linhas rótulo/valor

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
interface Assets {
  logo: { dataUrl: string; ratio: number } | null;
}

async function loadLogo(): Promise<Assets["logo"]> {
  try {
    const img = new Image();
    img.src = "/busa-logo.png";
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/png"),
      ratio: img.naturalWidth / img.naturalHeight,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Elementos do layout
// ---------------------------------------------------------------------------

/** Cabeçalho: wordmark Busa + gota à esquerda; título em duas linhas à direita
 *  com sublinhado ciano curto centralizado. */
function drawHeader(doc: jsPDF, assets: Assets, tituloL2: string): number {
  const y = 20;

  // Wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.setTextColor(...NAVY);
  doc.text("Busa", MARGIN, y + 9);
  const busaW = doc.getTextWidth("Busa");
  if (assets.logo) {
    const h = 12;
    doc.addImage(assets.logo.dataUrl, "PNG", MARGIN + busaW + 2.5, y - 2, h * assets.logo.ratio, h);
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("corretora de seguros", MARGIN, y + 15);

  // Título à direita
  const tx = PAGE_W - MARGIN - 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text("RELATÓRIO DE", tx, y + 3, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(tituloL2, tx, y + 9.5, { align: "center" });

  // Sublinhado ciano curto, centralizado sob o título
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(1.1);
  doc.line(tx - 7, y + 14.5, tx + 7, y + 14.5);

  return y + 28;
}

/** Título de seção numerado em azul. */
function sectionHeading(doc: jsPDF, y: number, texto: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...BLUE);
  doc.text(texto.toUpperCase(), MARGIN, y);
  return y + 7;
}

/** Linha rótulo/valor com filete cinza inferior. */
function kvRow(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_LABEL);
  doc.text(label, MARGIN, y);

  doc.setTextColor(...TEXT_DARK);
  const v = doc.splitTextToSize(value || "—", PAGE_W - MARGIN - VALUE_X);
  doc.text(v, VALUE_X, y);

  const rowH = 5 + (v.length - 1) * 4;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y + rowH - 1.6, PAGE_W - MARGIN, y + rowH - 1.6);
  return y + rowH + 2.8;
}

/** Parágrafo de texto corrido. */
function paragraph(doc: jsPDF, y: number, texto: string): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);
  const lines = doc.splitTextToSize(texto || "—", CONTENT_W);
  doc.text(lines, MARGIN, y);
  return y + lines.length * 4.4 + 4;
}

/** Linha "Rótulo: valor" com rótulo em negrito (ex.: Responsável: Carlos). */
function boldLabelLine(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`${label}:`, MARGIN, y);
  const w = doc.getTextWidth(`${label}: `);
  doc.setFont("helvetica", "normal");
  doc.text(value || "—", MARGIN + w + 1, y);
  return y + 5.2;
}

// ---------------------------------------------------------------------------
// Páginas de resumo (capa do relatório consolidado)
// ---------------------------------------------------------------------------
interface ResumoOpts {
  tituloL2: string;
  total: number;
  porStatus: Record<string, number>;
  filtros: string[];
  colunas: string[];
  linhas: string[][];
}

function drawResumoPages(doc: jsPDF, assets: Assets, opts: ResumoOpts) {
  let y = drawHeader(doc, assets, opts.tituloL2);

  y = sectionHeading(doc, y, "1. Resumo Geral");
  y = kvRow(doc, y, "Total de registros", String(opts.total));
  y = kvRow(doc, y, "Gerado em", formatDateTime(new Date().toISOString()));
  y = kvRow(
    doc,
    y,
    "Filtros aplicados",
    opts.filtros.length > 0 ? opts.filtros.join(" · ") : "Nenhum (visão geral)",
  );

  y += 3;
  y = sectionHeading(doc, y, "2. Distribuição por Status");
  for (const [status, count] of Object.entries(opts.porStatus)) {
    y = kvRow(doc, y, status, String(count));
  }

  y += 3;
  y = sectionHeading(doc, y, "3. Relação de Registros");

  const colW = [27, 27, 44, 30, CONTENT_W - 128];
  const drawTableHeader = (yy: number): number => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BLUE);
    let xx = MARGIN;
    opts.colunas.forEach((c, i) => {
      doc.text(c.toUpperCase(), xx, yy);
      xx += colW[i];
    });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.35);
    doc.line(MARGIN, yy + 1.8, PAGE_W - MARGIN, yy + 1.8);
    return yy + 6.5;
  };

  y = drawTableHeader(y);
  const bottomLimit = PAGE_H - 20;

  for (const linha of opts.linhas) {
    if (y > bottomLimit) {
      doc.addPage();
      y = drawHeader(doc, assets, opts.tituloL2);
      y = sectionHeading(doc, y, "3. Relação de Registros (continuação)");
      y = drawTableHeader(y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_DARK);
    let xx = MARGIN;
    let maxLines = 1;
    linha.forEach((celula, i) => {
      const wrapped = doc.splitTextToSize(celula || "—", colW[i] - 3);
      const shown = wrapped.slice(0, 2);
      doc.text(shown, xx, y);
      maxLines = Math.max(maxLines, shown.length);
      xx += colW[i];
    });
    const rowH = maxLines * 3.8 + 2.4;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y + rowH - 3, PAGE_W - MARGIN, y + rowH - 3);
    y += rowH + 1.2;
  }
}

// ---------------------------------------------------------------------------
// PDF: Relatório de Sinistros
// ---------------------------------------------------------------------------

export async function gerarPdfSinistros(
  sinistros: Sinistro[],
  clienteById: Map<string, Cliente>,
  filtros: string[],
  porStatus: Record<string, number>,
  incluirFichas: boolean,
): Promise<void> {
  const assets: Assets = { logo: await loadLogo() };
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawResumoPages(doc, assets, {
    tituloL2: "SINISTROS",
    total: sinistros.length,
    porStatus,
    filtros,
    colunas: ["Nº Sinistro", "Data", "Segurado", "Status", "Localização"],
    linhas: sinistros.map((s) => [
      s.numero,
      formatDate(s.data || s.createdAt),
      s.clienteNome,
      s.status,
      s.localizacaoSinistro || clienteById.get(s.clienteId)?.endereco || "—",
    ]),
  });

  if (incluirFichas) {
    for (const s of sinistros) {
      doc.addPage();
      let y = drawHeader(doc, assets, "SINISTRO");
      const cliente = clienteById.get(s.clienteId);

      y = sectionHeading(doc, y, "1. Dados do Sinistro");
      y = kvRow(doc, y, "Nº do Sinistro", s.numero);
      y = kvRow(
        doc,
        y,
        "Data do Sinistro",
        `${formatDate(s.data || s.createdAt)}${s.horaOcorrencia ? ` ${s.horaOcorrencia}` : ""}`,
      );
      y = kvRow(doc, y, "Tipo de Cobertura", s.naturezaSinistro || s.categoria || "Automóvel");
      y = kvRow(doc, y, "Segurado", s.clienteNome);
      y = kvRow(doc, y, "CPF/CNPJ", cliente?.documento || "—");
      y = kvRow(doc, y, "Seguradora", s.seguradoraNome);
      y = kvRow(doc, y, "Veículo", s.veiculo || "—");
      y = kvRow(doc, y, "Placa", s.placa || "—");
      y = kvRow(doc, y, "Local do Sinistro", s.localizacaoSinistro || cliente?.endereco || "—");
      if (s.oficinaNome) y = kvRow(doc, y, "Oficina", s.oficinaNome);

      y += 4;
      y = sectionHeading(doc, y, "2. Descrição do Sinistro");
      y = paragraph(doc, y, s.descricao);

      y += 2;
      y = sectionHeading(doc, y, "3. Danos Declarados");
      y = paragraph(doc, y, s.descricaoDanos || s.observacoes || "Sem danos adicionais declarados.");

      // Registro fotográfico (até 3 imagens anexadas)
      const fotos = s.documentos.filter((d) => d.tipo.startsWith("image/")).slice(0, 3);
      let proxSecao = 4;
      if (fotos.length > 0 && y < 205) {
        y += 2;
        y = sectionHeading(doc, y, `${proxSecao}. Registro Fotográfico`);
        proxSecao++;
        const fw = (CONTENT_W - 8) / 3;
        const fh = fw * 0.62;
        fotos.forEach((f, i) => {
          try {
            doc.addImage(f.dataUrl, MARGIN + i * (fw + 4), y, fw, fh);
          } catch {
            /* imagem inválida: ignora */
          }
        });
        y += fh + 8;
      }

      y += 2;
      y = sectionHeading(doc, y, `${proxSecao}. Status do Sinistro`);
      y = boldLabelLine(doc, y, "Status atual", s.status);
      if (s.status === "Finalizado" && s.resolvidoEm) {
        y = boldLabelLine(doc, y, "Concluído em", formatDateTime(s.resolvidoEm));
      }
    }
  }

  doc.save(`relatorio-sinistros-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ---------------------------------------------------------------------------
// PDF: Relatório de Assistências
// ---------------------------------------------------------------------------

export async function gerarPdfAssistencias(
  assistencias: Assistencia[],
  clienteById: Map<string, Cliente>,
  filtros: string[],
  porStatus: Record<string, number>,
  incluirFichas: boolean,
): Promise<void> {
  const assets: Assets = { logo: await loadLogo() };
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const localDe = (a: Assistencia) =>
    [a.origem, a.destino && a.destino !== "—" ? a.destino : ""]
      .filter(Boolean)
      .join(" → ") || "—";

  drawResumoPages(doc, assets, {
    tituloL2: "ASSISTÊNCIAS",
    total: assistencias.length,
    porStatus,
    filtros,
    colunas: ["Protocolo", "Data", "Segurado", "Status", "Tipo"],
    linhas: assistencias.map((a) => [
      a.protocolo,
      formatDate(a.data || a.createdAt),
      a.clienteNome,
      a.status,
      a.tipo,
    ]),
  });

  if (incluirFichas) {
    for (const a of assistencias) {
      doc.addPage();
      let y = drawHeader(doc, assets, "ASSISTÊNCIA");
      const cliente = clienteById.get(a.clienteId);

      y = sectionHeading(doc, y, "1. Dados Gerais");
      y = kvRow(doc, y, "Nº do Atendimento", a.protocolo);
      y = kvRow(
        doc,
        y,
        "Data/Hora",
        `${formatDate(a.data || a.createdAt)}${a.horario ? ` ${a.horario}` : ""}`,
      );
      y = kvRow(doc, y, "Tipo de Assistência", a.tipo);
      y = kvRow(doc, y, "Segurado", a.clienteNome);
      y = kvRow(doc, y, "CPF/CNPJ", cliente?.documento || "—");
      y = kvRow(doc, y, "Solicitante", a.solicitante || a.clienteNome);
      y = kvRow(doc, y, "Telefone", a.telefone || "—");
      y = kvRow(doc, y, "Local do Atendimento", localDe(a));

      y += 4;
      y = sectionHeading(doc, y, "2. Descrição do Atendimento");
      y = paragraph(doc, y, `${a.assunto ? a.assunto + ". " : ""}${a.descricao}`);

      y += 2;
      y = sectionHeading(doc, y, "3. Providências Tomadas");
      y = paragraph(doc, y, a.observacoes || "Atendimento acionado junto à seguradora.");

      y += 2;
      y = sectionHeading(doc, y, "4. Prestador do Serviço");
      y = kvRow(doc, y, "Seguradora", a.seguradoraNome);
      y = kvRow(doc, y, "Telefone", a.telefone || "—");

      y += 4;
      y = sectionHeading(doc, y, "5. Encerramento");
      y = paragraph(
        doc,
        y,
        a.concluidoEm
          ? `Atendimento concluído em ${formatDateTime(a.concluidoEm)}.`
          : a.status === "Cancelado"
            ? "Atendimento cancelado."
            : "Atendimento em aberto.",
      );
      y = boldLabelLine(doc, y, "Responsável", a.responsavel || "—");
      y = boldLabelLine(doc, y, "Status", a.status);
    }
  }

  doc.save(`relatorio-assistencias-${new Date().toISOString().slice(0, 10)}.pdf`);
}
