import type {
  StatusAssistencia,
  StatusSinistro,
  Papel,
} from "./types";

export interface StatusConfig {
  label: string;
  dot: string; // bg color for dot
  chip: string; // classes for chip background/text/border
}

export const STATUS_ASSISTENCIA: Record<StatusAssistencia, StatusConfig> = {
  "Em andamento": {
    label: "Em andamento",
    dot: "bg-sky-400",
    chip: "bg-sky-500/10 text-sky-300 border-sky-500/25",
  },
  Aguardando: {
    label: "Aguardando",
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  },
  Finalizado: {
    label: "Finalizado",
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  },
  Cancelado: {
    label: "Cancelado",
    dot: "bg-rose-400",
    chip: "bg-rose-500/10 text-rose-300 border-rose-500/25",
  },
};

export const STATUS_SINISTRO: Record<StatusSinistro, StatusConfig> = {
  Pendente: {
    label: "Pendente",
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  },
  Documentação: {
    label: "Documentação",
    dot: "bg-violet-400",
    chip: "bg-violet-500/10 text-violet-300 border-violet-500/25",
  },
  "Em análise": {
    label: "Em análise",
    dot: "bg-sky-400",
    chip: "bg-sky-500/10 text-sky-300 border-sky-500/25",
  },
  "Em oficina": {
    label: "Em oficina",
    dot: "bg-cyan-400",
    chip: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
  },
  Finalizado: {
    label: "Finalizado",
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  },
  Cancelado: {
    label: "Cancelado",
    dot: "bg-rose-400",
    chip: "bg-rose-500/10 text-rose-300 border-rose-500/25",
  },
};

export const STATUS_ASSISTENCIA_OPTS: StatusAssistencia[] = [
  "Em andamento",
  "Aguardando",
  "Finalizado",
  "Cancelado",
];

export const STATUS_SINISTRO_OPTS: StatusSinistro[] = [
  "Pendente",
  "Documentação",
  "Em análise",
  "Em oficina",
  "Finalizado",
  "Cancelado",
];

export const TIPOS_ASSISTENCIA = [
  "Guincho",
  "Reboque",
  "Pneu furado",
  "Pane seca / elétrica",
  "Chaveiro",
  "Pane mecânica",
  "Troca de bateria",
  "Transporte alternativo",
  "Outros",
];

export const PAPEL_OPTS: Papel[] = ["Administrador", "Funcionário"];

export const PAPEL_CONFIG: Record<Papel, StatusConfig> = {
  Administrador: {
    label: "Administrador",
    dot: "bg-brand",
    chip: "bg-brand/15 text-violet-200 border-brand/30",
  },
  Funcionário: {
    label: "Funcionário",
    dot: "bg-brand2",
    chip: "bg-brand2/15 text-blue-200 border-brand2/30",
  },
};

// Esquema de cores para partes envolvidas em sinistros
export type ParteEnvolvida = "segurado" | "terceiro";

export const PARTE_ENVOLVIDA: Record<ParteEnvolvida, StatusConfig> = {
  segurado: {
    label: "Segurado",
    dot: "bg-blue-400",
    chip: "bg-blue-500/10 text-blue-300 border-blue-500/25",
  },
  terceiro: {
    label: "Terceiro",
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  },
};

export const PARTE_ENVOLVIDA_OPTS: ParteEnvolvida[] = ["segurado", "terceiro"];
