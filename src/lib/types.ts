// Domain types for the Seguros CRM

export type Papel = "Administrador" | "Funcionário";

export type StatusAssistencia =
  | "Em andamento"
  | "Aguardando"
  | "Finalizado"
  | "Cancelado";

export type StatusSinistro =
  | "Pendente"
  | "Documentação"
  | "Em análise"
  | "Em oficina"
  | "Finalizado"
  | "Cancelado";

export type TipoSinistro = "Automóvel" | "Ramos Elementares";

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
  ativo: boolean;
  excluido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string; // CPF/CNPJ
  telefone: string;
  email: string;
  endereco: string;
  excluido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Seguradora {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  excluido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Oficina {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  excluido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Assistencia {
  id: string;
  protocolo: string;
  clienteId: string;
  clienteNome: string;
  solicitante: string;
  telefone: string;
  seguradoraId: string;
  seguradoraNome: string;
  tipo: string;
  assunto: string;
  descricao: string;
  origem: string;
  destino: string;
  data: string;
  horario: string;
  observacoes: string;
  responsavel: string;
  status: StatusAssistencia;
  documentos: Documento[];
  concluidoEm?: string;
  excluido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sinistro {
  id: string;
  numero: string;
  categoria?: TipoSinistro;
  clienteId: string;
  clienteNome: string;
  veiculo: string;
  placa: string;
  seguradoraId: string;
  seguradoraNome: string;
  oficinaId: string;
  oficinaNome: string;
  data: string;
  horaOcorrencia?: string;
  tipoBem?: string;
  naturezaSinistro?: string;
  localizacaoSinistro?: string;
  descricaoDanos?: string;
  contatoSegurado?: string;
  testemunhas?: string;
  descricao: string;
  observacoes: string;
  status: StatusSinistro;
  documentos: Documento[];
  resolvidoEm?: string;
  parteEnvolvida?: "segurado" | "terceiro"; // azul = segurado, amarelo = terceiro
  excluido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  modulo: string;
  entidadeId: string;
  entidadeNome: string;
  detalhes: string;
}

export interface AppData {
  usuarios: Usuario[];
  clientes: Cliente[];
  seguradoras: Seguradora[];
  oficinas: Oficina[];
  assistencias: Assistencia[];
  sinistros: Sinistro[];
  logs: LogEntry[];
}

export type View =
  | "dashboard"
  | "nova-assistencia"
  | "assistencias"
  | "novo-sinistro"
  | "sinistros"
  | "buscar"
  | "clientes"
  | "seguradoras"
  | "oficinas"
  | "usuarios"
  | "logs";

export interface NavParams {
  id?: string;
  [key: string]: unknown;
}
