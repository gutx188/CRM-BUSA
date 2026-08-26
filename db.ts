import type {
  AppData,
  Usuario,
  Cliente,
  Seguradora,
  Oficina,
  Assistencia,
  Sinistro,
  LogEntry,
  StatusAssistencia,
  StatusSinistro,
} from "./types";
import { uid, todayISODate } from "./utils";

const STORAGE_KEY = "seguros_crm_data_v1";
const SESSION_KEY = "seguros_crm_session_v1";

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
function seed(): AppData {
  const t = Date.now();
  const createdAt = (days: number) =>
    new Date(t - days * 86400000).toISOString();

  const usuarios: Usuario[] = [
    {
      id: "u-admin",
      nome: "Marina Costa",
      email: "admin@corretora.com",
      senha: "",
      papel: "Administrador",
      ativo: true,
      excluido: false,
      createdAt: createdAt(120),
      updatedAt: createdAt(10),
    },
    {
      id: "u-func",
      nome: "Rafael Lima",
      email: "funcionario@corretora.com",
      senha: "",
      papel: "Funcionário",
      ativo: true,
      excluido: false,
      createdAt: createdAt(90),
      updatedAt: createdAt(5),
    },
  ];

  const seguradoras: Seguradora[] = [
    {
      id: "seg-1",
      nome: "Porto Seguro",
      telefone: "(11) 3000-0000",
      email: "sac@portoseguro.com.br",
      excluido: false,
      createdAt: createdAt(100),
      updatedAt: createdAt(100),
    },
    {
      id: "seg-2",
      nome: "SulAmérica",
      telefone: "(11) 3333-4444",
      email: "atendimento@sulamerica.com.br",
      excluido: false,
      createdAt: createdAt(100),
      updatedAt: createdAt(100),
    },
    {
      id: "seg-3",
      nome: "Bradesco Auto",
      telefone: "(11) 4002-8922",
      email: "auto@bradesco.com.br",
      excluido: false,
      createdAt: createdAt(100),
      updatedAt: createdAt(100),
    },
    {
      id: "seg-4",
      nome: "HDI Seguros",
      telefone: "(11) 3634-5500",
      email: "sac@hdi.com.br",
      excluido: false,
      createdAt: createdAt(100),
      updatedAt: createdAt(100),
    },
    {
      id: "seg-5",
      nome: "Allianz",
      telefone: "(11) 0800-118488",
      email: "sac@allianz.com.br",
      excluido: false,
      createdAt: createdAt(100),
      updatedAt: createdAt(100),
    },
  ];

  const oficinas: Oficina[] = [
    {
      id: "of-1",
      nome: "Auto Center Veloz",
      telefone: "(11) 2990-1100",
      endereco: "Av. Paulista, 1500 - São Paulo/SP",
      excluido: false,
      createdAt: createdAt(95),
      updatedAt: createdAt(95),
    },
    {
      id: "of-2",
      nome: "Oficina Marte",
      telefone: "(11) 2877-2233",
      endereco: "Rua das Palmeiras, 320 - São Paulo/SP",
      excluido: false,
      createdAt: createdAt(95),
      updatedAt: createdAt(95),
    },
    {
      id: "of-3",
      nome: "Funilaria Premium",
      telefone: "(11) 2456-7788",
      endereco: "Av. Brasil, 88 - Guarulhos/SP",
      excluido: false,
      createdAt: createdAt(95),
      updatedAt: createdAt(95),
    },
  ];

  const clientes: Cliente[] = [
    {
      id: "cli-1",
      nome: "João Pereira",
      documento: "123.456.789-00",
      telefone: "(11) 98888-1010",
      email: "joao.pereira@email.com",
      endereco: "Rua das Flores, 45 - São Paulo/SP",
      excluido: false,
      createdAt: createdAt(80),
      updatedAt: createdAt(10),
    },
    {
      id: "cli-2",
      nome: "Ana Souza",
      documento: "987.654.321-99",
      telefone: "(11) 97777-2020",
      email: "ana.souza@email.com",
      endereco: "Av. Ibirapuera, 200 - São Paulo/SP",
      excluido: false,
      createdAt: createdAt(70),
      updatedAt: createdAt(70),
    },
    {
      id: "cli-3",
      nome: "Construtora Alvorada LTDA",
      documento: "12.345.678/0001-90",
      telefone: "(11) 3322-3030",
      email: "contato@alvorada.com.br",
      endereco: "Rod. Anhanguera, km 25 - Campinas/SP",
      excluido: false,
      createdAt: createdAt(60),
      updatedAt: createdAt(60),
    },
    {
      id: "cli-4",
      nome: "Carlos Mendes",
      documento: "456.789.123-44",
      telefone: "(11) 96666-4040",
      email: "carlos.mendes@email.com",
      endereco: "Rua Tietê, 12 - São Paulo/SP",
      excluido: false,
      createdAt: createdAt(45),
      updatedAt: createdAt(45),
    },
    {
      id: "cli-5",
      nome: "Fernanda Dias",
      documento: "321.654.987-11",
      telefone: "(11) 95555-5050",
      email: "fernanda.dias@email.com",
      endereco: "Al. Santos, 900 - São Paulo/SP",
      excluido: false,
      createdAt: createdAt(30),
      updatedAt: createdAt(30),
    },
  ];

  const statusA: StatusAssistencia[] = [
    "Em andamento",
    "Em andamento",
    "Aguardando",
    "Aguardando",
    "Finalizado",
    "Finalizado",
    "Cancelado",
  ];
  const assistencias: Assistencia[] = [
    {
      id: "ast-1",
      protocolo: "AST-2026-0001",
      clienteId: "cli-1",
      clienteNome: "João Pereira",
      solicitante: "João Pereira",
      telefone: "(11) 98888-1010",
      seguradoraId: "seg-1",
      seguradoraNome: "Porto Seguro",
      tipo: "Guincho",
      assunto: "Veículo parado após bateria",
      descricao: "Cliente relatou pane elétrica em via de grande movimento.",
      origem: "Av. Paulista, 1000",
      destino: "Residência do cliente",
      data: todayISODate(),
      horario: "09:30",
      observacoes: "Solicitar guincho plataforma.",
      responsavel: "Rafael Lima",
      status: statusA[0],
      documentos: [],
      excluido: false,
      createdAt: createdAt(2),
      updatedAt: createdAt(0),
    },
    {
      id: "ast-2",
      protocolo: "AST-2026-0002",
      clienteId: "cli-2",
      clienteNome: "Ana Souza",
      solicitante: "Ana Souza",
      telefone: "(11) 97777-2020",
      seguradoraId: "seg-2",
      seguradoraNome: "SulAmérica",
      tipo: "Pneu furado",
      assunto: "Troca de pneu na rodovia",
      descricao: "Pneu dianteiro direito furado em rodovia.",
      origem: "Rod. dos Bandeirantes, km 30",
      destino: "Posto mais próximo",
      data: todayISODate(),
      horario: "14:00",
      observacoes: "",
      responsavel: "Marina Costa",
      status: statusA[1],
      documentos: [],
      excluido: false,
      createdAt: createdAt(1),
      updatedAt: createdAt(1),
    },
    {
      id: "ast-3",
      protocolo: "AST-2026-0003",
      clienteId: "cli-3",
      clienteNome: "Construtora Alvorada LTDA",
      solicitante: "Sérgio (motorista)",
      telefone: "(11) 3322-3030",
      seguradoraId: "seg-3",
      seguradoraNome: "Bradesco Auto",
      tipo: "Chaveiro",
      assunto: "Chaves deixadas dentro do veículo",
      descricao: "Caminhonete da frota trancada com chave interna.",
      origem: "Centro de distribuição",
      destino: "—",
      data: createdAt(3).slice(0, 10),
      horario: "08:15",
      observacoes: "Frota corporativa.",
      responsavel: "Rafael Lima",
      status: statusA[4],
      documentos: [],
      concluidoEm: createdAt(2),
      excluido: false,
      createdAt: createdAt(3),
      updatedAt: createdAt(2),
    },
    {
      id: "ast-4",
      protocolo: "AST-2026-0004",
      clienteId: "cli-4",
      clienteNome: "Carlos Mendes",
      solicitante: "Carlos Mendes",
      telefone: "(11) 96666-4040",
      seguradoraId: "seg-1",
      seguradoraNome: "Porto Seguro",
      tipo: "Pane seca / elétrica",
      assunto: "Veículo não liga",
      descricao: "Pane seca, possível problema no alternador.",
      origem: "Rua Tietê, 12",
      destino: "Oficina Marte",
      data: createdAt(5).slice(0, 10),
      horario: "17:40",
      observacoes: "",
      responsavel: "Rafael Lima",
      status: statusA[5],
      concluidoEm: createdAt(4),
      documentos: [],
      excluido: false,
      createdAt: createdAt(5),
      updatedAt: createdAt(4),
    },
    {
      id: "ast-5",
      protocolo: "AST-2026-0005",
      clienteId: "cli-5",
      clienteNome: "Fernanda Dias",
      solicitante: "Fernanda Dias",
      telefone: "(11) 95555-5050",
      seguradoraId: "seg-4",
      seguradoraNome: "HDI Seguros",
      tipo: "Transporte alternativo",
      assunto: "Transporte após sinistro",
      descricao: "Cliente necessita transporte até residência.",
      origem: "Local do evento",
      destino: "Al. Santos, 900",
      data: createdAt(6).slice(0, 10),
      horario: "11:00",
      observacoes: "Cancelado pelo cliente.",
      responsavel: "Marina Costa",
      status: statusA[6],
      concluidoEm: createdAt(6),
      documentos: [],
      excluido: false,
      createdAt: createdAt(6),
      updatedAt: createdAt(6),
    },
  ];

  const statusS: StatusSinistro[] = [
    "Pendente",
    "Em análise",
    "Em oficina",
    "Finalizado",
    "Documentação",
  ];
  const sinistros: Sinistro[] = [
    {
      id: "sin-1",
      numero: "SIN-2026-0001",
      clienteId: "cli-1",
      clienteNome: "João Pereira",
      veiculo: "Honda Civic 2022",
      placa: "ABC1D23",
      seguradoraId: "seg-1",
      seguradoraNome: "Porto Seguro",
      oficinaId: "of-2",
      oficinaNome: "Oficina Marte",
      data: todayISODate(),
      descricao: "Colisão traseira em semáforo, parachoque danificado.",
      observacoes: "Boletim de ocorrência anexado.",
      status: statusS[1],
      documentos: [],
      parteEnvolvida: "segurado",
      excluido: false,
      createdAt: createdAt(4),
      updatedAt: createdAt(0),
    },
    {
      id: "sin-2",
      numero: "SIN-2026-0002",
      clienteId: "cli-2",
      clienteNome: "Ana Souza",
      veiculo: "Jeep Compass 2021",
      placa: "DEF2G34",
      seguradoraId: "seg-2",
      seguradoraNome: "SulAmérica",
      oficinaId: "of-1",
      oficinaNome: "Auto Center Veloz",
      data: createdAt(2).slice(0, 10),
      descricao: "Roubo de retrovisor e arranhão lateral.",
      observacoes: "",
      status: statusS[2],
      documentos: [],
      parteEnvolvida: "terceiro",
      excluido: false,
      createdAt: createdAt(3),
      updatedAt: createdAt(1),
    },
    {
      id: "sin-3",
      numero: "SIN-2026-0003",
      clienteId: "cli-4",
      clienteNome: "Carlos Mendes",
      veiculo: "Fiat Toro 2020",
      placa: "GHI3J45",
      seguradoraId: "seg-3",
      seguradoraNome: "Bradesco Auto",
      oficinaId: "of-3",
      oficinaNome: "Funilaria Premium",
      data: createdAt(8).slice(0, 10),
      descricao: "Danos por enchente, parte elétrica comprometida.",
      observacoes: "Perícia realizada.",
      status: statusS[3],
      resolvidoEm: createdAt(2),
      documentos: [],
      parteEnvolvida: "segurado",
      excluido: false,
      createdAt: createdAt(9),
      updatedAt: createdAt(2),
    },
    {
      id: "sin-4",
      numero: "SIN-2026-0004",
      clienteId: "cli-5",
      clienteNome: "Fernanda Dias",
      veiculo: "Toyota Corolla 2023",
      placa: "JKL4M56",
      seguradoraId: "seg-5",
      seguradoraNome: "Allianz",
      oficinaId: "of-1",
      oficinaNome: "Auto Center Veloz",
      data: createdAt(1).slice(0, 10),
      descricao: "Quebra de para-brisa por impacto de pedra.",
      observacoes: "Aguardando autorização para troca.",
      status: statusS[0],
      documentos: [],
      parteEnvolvida: "terceiro",
      excluido: false,
      createdAt: createdAt(1),
      updatedAt: createdAt(1),
    },
  ];

  const logs: LogEntry[] = [
    {
      id: uid("log-"),
      timestamp: createdAt(2),
      usuario: "Marina Costa",
      acao: "criou",
      modulo: "Sinistro",
      entidadeId: "sin-3",
      entidadeNome: "SIN-2026-0003",
      detalhes: "Abertura de sinistro para Carlos Mendes.",
    },
    {
      id: uid("log-"),
      timestamp: createdAt(1),
      usuario: "Rafael Lima",
      acao: "editou",
      modulo: "Assistência",
      entidadeId: "ast-1",
      entidadeNome: "AST-2026-0001",
      detalhes: "Atualização da descrição e responsável.",
    },
    {
      id: uid("log-"),
      timestamp: createdAt(0),
      usuario: "Marina Costa",
      acao: "resolveu",
      modulo: "Sinistro",
      entidadeId: "sin-3",
      entidadeNome: "SIN-2026-0003",
      detalhes: "Sinisto finalizado e movido ao histórico.",
    },
  ];

  return {
    usuarios,
    clientes,
    seguradoras,
    oficinas,
    assistencias,
    sinistros,
    logs,
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      saveData(s);
      return s;
    }
    const parsed = JSON.parse(raw) as AppData;
    // basic integrity
    return {
      usuarios: parsed.usuarios ?? [],
      clientes: parsed.clientes ?? [],
      seguradoras: parsed.seguradoras ?? [],
      oficinas: parsed.oficinas ?? [],
      assistencias: parsed.assistencias ?? [],
      sinistros: parsed.sinistros ?? [],
      logs: parsed.logs ?? [],
    };
  } catch {
    const s = seed();
    return s;
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    // likely quota exceeded (base64 documents)
    console.warn("Falha ao salvar (armazenamento cheio)", e);
    return false;
  }
}

export function resetData(): AppData {
  const s = seed();
  saveData(s);
  return s;
}

export function getSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionUserId(id: string | null): void {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Branding (logo + nome da corretora) — salvo à parte para sobreviver ao reset
// ---------------------------------------------------------------------------
export interface Branding {
  logoUrl: string | null;
  brokerName: string;
  brokerTagline: string;
}

const BRANDING_KEY = "seguros_crm_branding_v1";

const DEFAULT_BRANDING: Branding = {
  logoUrl: null,
  brokerName: "Busa Seguros",
  brokerTagline: "Corretora de Seguros",
};

export function loadBranding(): Branding {
  try {
    const raw = localStorage.getItem(BRANDING_KEY);
    if (!raw) return DEFAULT_BRANDING;
    const parsed = JSON.parse(raw) as Partial<Branding>;
    return {
      logoUrl: parsed.logoUrl ?? null,
      brokerName: parsed.brokerName || DEFAULT_BRANDING.brokerName,
      brokerTagline:
        parsed.brokerTagline ?? DEFAULT_BRANDING.brokerTagline,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveBranding(b: Branding): void {
  try {
    localStorage.setItem(BRANDING_KEY, JSON.stringify(b));
  } catch (e) {
    console.warn("Falha ao salvar branding", e);
  }
}
