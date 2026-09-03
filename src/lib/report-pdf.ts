import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { Assistencia, Sinistro, Cliente, StatusSinistro } from "./types";
import { formatDate, formatDateTime } from "./utils";

// ---------------------------------------------------------------------------
// Paleta do documento (visual do papel timbrado Busa)
// ---------------------------------------------------------------------------
const NAVY: [number, number, number] = [10, 37, 64]; // #0a2540
const BRAND: [number, number, number] = [27, 163, 224]; // #1ba3e0
const TEXT_DARK: [number, number, number] = [30, 41, 59];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [226, 232, 240];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ---------------------------------------------------------------------------
// Assets (logo + QR) carregados uma única vez por exportação
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

async function makeQr(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 0,
    width: 256,
    color: { dark: "#0a2540", light: "#ffffff" },
  });
}

// ---------------------------------------------------------------------------
// Elementos gráficos do timbrado
// ---------------------------------------------------------------------------

/** Cantos decorativos navy (superior direito e inferior esquerdo) + acento ciano. */
function drawFrame(doc: jsPDF) {
  // Canto superior direito: bloco navy arredondado saindo da página
  doc.setFillColor(...NAVY);
  doc.roundedRect(PAGE_W - 38, -14, 60, 42, 12, 12, "F");
  // Acento ciano fino sob o bloco
  doc.setFillColor(...BRAND);
  doc.circle(PAGE_W - 6, 34, 3.2, "F");

  // Canto inferior esquerdo: quarto de círculo navy
  doc.setFillColor(...NAVY);
  doc.circle(0, PAGE_H, 34, "F");
  doc.setFillColor(...BRAND);
  doc.circle(0, PAGE_H, 12, "F");

  // Canto inferior direito: onda pequena
  doc.setFillColor(...NAVY);
  doc.circle(PAGE_W, PAGE_H, 22, "F");
}

/** Cabeçalho: logo Busa + título do documento à direita. */
function drawHeader(doc: jsPDF, assets: Assets, tituloL1: string, tituloL2: string) {
  const y = 16;
  let x = MARGIN;

  // Wordmark "Busa" + gota
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...NAVY);
  doc.text("Busa", x, y + 9);
  const busaW = doc.getTextWidth("Busa");
  if (assets.logo) {
    const h = 11;
    doc.addImage(assets.logo.dataUrl, "PNG", x + busaW + 2, y - 1.5, h * assets.logo.ratio, h);
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("corretora de seguros", x, y + 14.5);

  // Título à direita
  const tx = PAGE_W - 46;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text(tituloL1, tx, y + 4, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(tituloL2, tx, y + 9.5, { align: "center" });
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.9);
  const underW = Math.max(doc.getTextWidth(tituloL2), 22);
  doc.line(tx - underW / 2, y + 12, tx + underW / 2, y + 12);

  return y + 24; // y inicial do conteúdo
}

function sectionHeading(doc: jsPDF, y: number, texto: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND);
  doc.text(texto.toUpperCase(), MARGIN, y);
  return y + 5.5;
}

/** Linha rótulo/valor com filete inferior, como no documento da imagem. */
function kvRow(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(label, MARGIN, y);
  doc.setTextColor(...TEXT_DARK);
  doc.setFont("helvetica", "bold");
  const v = doc.splitTextToSize(value || "—", CONTENT_W - 62);
  doc.text(v, MARGIN + 60, y);
  const rowH = 4 + (v.length - 1) * 3.8;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + rowH - 1.4, PAGE_W - MARGIN, y + rowH - 1.4);
  return y + rowH + 2.4;
}

function paragraph(doc: jsPDF, y: number, texto: string): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  const lines = doc.splitTextToSize(texto || "—", CONTENT_W);
  doc.text(lines, MARGIN, y);
  return y + lines.length * 3.9 + 3;
}

/** Rodapé com QR code e link de acompanhamento. */
function drawFooterQr(doc: jsPDF, qrDataUrl: string, titulo: string, link: string) {
  const y = PAGE_H - 34;
  const qrSize = 17;
  doc.addImage(qrDataUrl, "PNG", MARGIN + 4, y, qrSize, qrSize);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(titulo, MARGIN + 4 + qrSize + 5, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Escaneie o QR Code ou acesse:", MARGIN + 4 + qrSize + 5, y + 9.5);
  doc.setTextColor(...BRAND);
  doc.text(link, MARGIN + 4 + qrSize + 5, y + 13.5);
}

/** Timeline horizontal de status (como no relatório de sinistro da imagem). */
function drawTimeline(
  doc: jsPDF,
  y: number,
  etapas: { label: string; sub?: string }[],
  concluidas: number,
  cancelado: boolean,
): number {
  const usableW = CONTENT_W - 20;
  const step = usableW / (etapas.length - 1);
  const cy = y + 4;
  const r = 3.4;

  etapas.forEach((etapa, i) => {
    const cx = MARGIN + 10 + i * step;

    // Conector
    if (i < etapas.length - 1) {
      doc.setDrawColor(...(i < concluidas ? NAVY : LINE));
      doc.setLineWidth(0.7);
      doc.line(cx + r, cy, cx + step - r, cy);
    }

    const done = i < concluidas;
    if (done && !cancelado) {
      doc.setFillColor(...NAVY);
      doc.circle(cx, cy, r, "F");
      // check
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.6);
      doc.line(cx - 1.4, cy, cx - 0.3, cy + 1.2);
      doc.line(cx - 0.3, cy + 1.2, cx + 1.6, cy - 1.2);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...(cancelado ? ([225, 29, 72] as [number, number, number]) : LINE));
      doc.setLineWidth(0.7);
      doc.circle(cx, cy, r, "FD");
    }

    doc.setFont("helvetica", done ? "bold" : "normal");
    doc.setFontSize(7);
    doc.setTextColor(...(done ? NAVY : TEXT_MUTED));
    const lines = doc.splitTextToSize(etapa.label, step - 4);
    doc.text(lines, cx, cy + r + 4, { align: "center" });
    if (etapa.sub) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(etapa.sub, cx, cy + r + 4 + lines.length * 3, { align: "center" });
    }
  });

  return y + 22;
}

// ---------------------------------------------------------------------------
// Página de resumo (capa do relatório)
// ---------------------------------------------------------------------------
interface ResumoOpts {
  tituloL2: string;
  total: number;
  porStatus: Record<string, number>;
  filtros: string[];
  colunas: string[];
  linhas: string[][];
  qr: string;
  linkQr: string;
  qrTitulo: string;
}

function drawResumoPages(doc: jsPDF, assets: Assets, opts: ResumoOpts) {
  drawFrame(doc);
  let y = drawHeader(doc, assets, "RELATÓRIO DE", opts.tituloL2);

  y = sectionHeading(doc, y, "1. Resumo Geral");
  y = kvRow(doc, y, "Total de registros", String(opts.total));
  y = kvRow(doc, y, "Gerado em", formatDateTime(new Date().toISOString()));
  y = kvRow(
    doc,
    y,
    "Filtros aplicados",
    opts.filtros.length > 0 ? opts.filtros.join(" · ") : "Nenhum (visão geral)",
  );

  y += 2;
  y = sectionHeading(doc, y, "2. Distribuição por Status");
  for (const [status, count] of Object.entries(opts.porStatus)) {
    y = kvRow(doc, y, status, String(count));
  }

  y += 2;
  y = sectionHeading(doc, y, "3. Relação de Registros");

  const colW = [26, 30, 46, 30, CONTENT_W - 132];
  const drawTableHeader = (yy: number): number => {
    doc.setFillColor(244, 247, 250);
    doc.rect(MARGIN, yy - 3.5, CONTENT_W, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...NAVY);
    let xx = MARGIN + 1.5;
    opts.colunas.forEach((c, i) => {
      doc.text(c.toUpperCase(), xx, yy);
      xx += colW[i];
    });
    return yy + 5.5;
  };

  y = drawTableHeader(y);
  const bottomLimit = PAGE_H - 42;

  for (const linha of opts.linhas) {
    if (y > bottomLimit) {
      drawFooterQr(doc, opts.qr, opts.qrTitulo, opts.linkQr);
      doc.addPage();
      drawFrame(doc);
      y = drawHeader(doc, assets, "RELATÓRIO DE", opts.tituloL2);
      y = sectionHeading(doc, y, "3. Relação de Registros (continuação)");
      y = drawTableHeader(y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_DARK);
    let xx = MARGIN + 1.5;
    let maxLines = 1;
    linha.forEach((celula, i) => {
      const wrapped = doc.splitTextToSize(celula || "—", colW[i] - 3);
      const shown = wrapped.slice(0, 2);
      doc.text(shown, xx, y);
      maxLines = Math.max(maxLines, shown.length);
      xx += colW[i];
    });
    const rowH = maxLines * 3.4 + 2;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y + rowH - 2.6, PAGE_W - MARGIN, y + rowH - 2.6);
    y += rowH + 1;
  }

  drawFooterQr(doc, opts.qr, opts.qrTitulo, opts.linkQr);
}

// ---------------------------------------------------------------------------
// PDF: Relatório de Sinistros
// ---------------------------------------------------------------------------

const ETAPAS_SINISTRO: { chave: StatusSinistro[]; label: string }[] = [
  { chave: ["Pendente", "Documentação"], label: "Aviso Recebido" },
  { chave: ["Em análise"], label: "Análise" },
  { chave: ["Em oficina"], label: "Em Oficina" },
  { chave: ["Finalizado"], label: "Conclusão" },
];

function etapasConcluidas(status: StatusSinistro): number {
  switch (status) {
    case "Pendente":
    case "Documentação":
      return 1;
    case "Em análise":
      return 2;
    case "Em oficina":
      return 3;
    case "Finalizado":
      return 4;
    case "Cancelado":
      return 0;
  }
}

export async function gerarPdfSinistros(
  sinistros: Sinistro[],
  clienteById: Map<string, Cliente>,
  filtros: string[],
  porStatus: Record<string, number>,
  incluirFichas: boolean,
): Promise<void> {
  const assets: Assets = { logo: await loadLogo() };
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const qrGeral = await makeQr("https://busaseguros.com.br/sinistros");

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
    qr: qrGeral,
    linkQr: "busaseguros.com.br/sinistros",
    qrTitulo: "Acompanhe seus sinistros",
  });

  if (incluirFichas) {
    for (const s of sinistros) {
      doc.addPage();
      drawFrame(doc);
      let y = drawHeader(doc, assets, "RELATÓRIO DE", "SINISTRO");
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
      y = kvRow(
        doc,
        y,
        "Local do Sinistro",
        s.localizacaoSinistro || cliente?.endereco || "—",
      );
      if (s.oficinaNome) y = kvRow(doc, y, "Oficina", s.oficinaNome);

      y += 2;
      y = sectionHeading(doc, y, "2. Descrição do Sinistro");
      y = paragraph(doc, y, s.descricao);

      y += 1;
      y = sectionHeading(doc, y, "3. Danos Declarados");
      y = paragraph(doc, y, s.descricaoDanos || s.observacoes || "Sem danos adicionais declarados.");

      // Registro fotográfico (até 3 imagens dos documentos)
      const fotos = s.documentos.filter((d) => d.tipo.startsWith("image/")).slice(0, 3);
      if (fotos.length > 0 && y < 195) {
        y += 1;
        y = sectionHeading(doc, y, "4. Registro Fotográfico");
        const fw = (CONTENT_W - 8) / 3;
        const fh = fw * 0.62;
        fotos.forEach((f, i) => {
          try {
            doc.addImage(f.dataUrl, MARGIN + i * (fw + 4), y, fw, fh);
          } catch {
            /* imagem inválida: ignora */
          }
        });
        y += fh + 6;
      }

      y += 1;
      y = sectionHeading(
        doc,
        y,
        `${fotos.length > 0 ? "5" : "4"}. Status do Sinistro${s.status === "Cancelado" ? " — CANCELADO" : ""}`,
      );
      y = drawTimeline(
        doc,
        y,
        ETAPAS_SINISTRO.map((e, i) => ({
          label: e.label,
          sub:
            i === etapasConcluidas(s.status) - 1
              ? s.status === "Finalizado" && s.resolvidoEm
                ? formatDate(s.resolvidoEm)
                : s.status
              : undefined,
        })),
        etapasConcluidas(s.status),
        s.status === "Cancelado",
      );

      const qr = await makeQr(`https://busaseguros.com.br/sinistro/${s.numero}`);
      drawFooterQr(doc, qr, "Acompanhe seu sinistro", `busaseguros.com.br/sinistro/${s.numero}`);
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
  const qrGeral = await makeQr("https://busaseguros.com.br/atendimentos");

  const localDe = (a: Assistencia) =>
    [a.origem, a.destino && a.destino !== "—" ? a.destino : ""]
      .filter(Boolean)
      .join(" → ") || "—";

  drawResumoPages(doc, assets, {
    tituloL2: "ASSISTÊNCIA",
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
    qr: qrGeral,
    linkQr: "busaseguros.com.br/atendimentos",
    qrTitulo: "Acompanhe seus atendimentos",
  });

  if (incluirFichas) {
    for (const a of assistencias) {
      doc.addPage();
      drawFrame(doc);
      let y = drawHeader(doc, assets, "RELATÓRIO DE", "ASSISTÊNCIA");
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
      y = kvRow(doc, y, "Seguradora", a.seguradoraNome);
      y = kvRow(doc, y, "Local do Atendimento", localDe(a));

      y += 2;
      y = sectionHeading(doc, y, "2. Descrição do Atendimento");
      y = paragraph(doc, y, `${a.assunto ? a.assunto + ". " : ""}${a.descricao}`);

      y += 1;
      y = sectionHeading(doc, y, "3. Providências Tomadas");
      y = paragraph(doc, y, a.observacoes || "Atendimento acionado junto à seguradora.");

      y += 1;
      y = sectionHeading(doc, y, "4. Responsável pelo Atendimento");
      y = kvRow(doc, y, "Responsável", a.responsavel || "—");
      y = kvRow(doc, y, "Status atual", a.status);

      y += 2;
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

      const qr = await makeQr(`https://busaseguros.com.br/atendimento/${a.protocolo}`);
      drawFooterQr(
        doc,
        qr,
        "Acompanhe seu atendimento",
        `busaseguros.com.br/atendimento/${a.protocolo}`,
      );
    }
  }

  doc.save(`relatorio-assistencias-${new Date().toISOString().slice(0, 10)}.pdf`);
}
