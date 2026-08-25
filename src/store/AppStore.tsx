import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppData,
  Assistencia,
  Cliente,
  LogEntry,
  Oficina,
  Seguradora,
  Sinistro,
  Usuario,
  View,
  NavParams,
} from "../lib/types";
import {
  loadData,
  saveData,
  resetData,
  loadBranding,
  saveBranding,
  type Branding,
} from "../lib/db";
import {
  isCloudConfigured,
  loadFromCloud,
  saveToCloud,
  subscribeToCloud,
  testConnection,
  loadCloudConfig,
  saveCloudConfig,
  getLastRemoteAt,
  setLastRemoteAt,
  resetClient,
  type CloudConfig,
  type SyncStatus,
} from "../lib/cloud";
import { uid, nowISO, normalize } from "../lib/utils";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface SearchResult {
  tipo: "Assistência" | "Sinistro";
  id: string;
  titulo: string;
  sub: string;
  match: string;
  status: string;
  data: string;
}

interface AppContextValue {
  data: AppData;
  usuarios: Usuario[];
  clientes: Cliente[];
  seguradoras: Seguradora[];
  oficinas: Oficina[];
  assistencias: Assistencia[];
  sinistros: Sinistro[];
  logs: LogEntry[];

  view: View;
  params: NavParams;
  navigate: (view: View, params?: NavParams) => void;

  branding: Branding;
  setBranding: (b: Partial<Branding>) => void;

  cloudEnabled: boolean;
  syncStatus: SyncStatus;
  cloudWorkspace: string | null;
  lastSyncedAt: string | null;
  saveCloudConfigAction: (c: CloudConfig) => Promise<{ ok: boolean; msg: string }>;
  disconnectCloud: () => void;

  toasts: Toast[];
  notify: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;

  log: (
    acao: string,
    modulo: string,
    entidadeId: string,
    entidadeNome: string,
    detalhes: string,
  ) => void;

  saveUsuario: (u: Partial<Usuario> & { id?: string }) => void;
  removeUsuario: (id: string) => void;
  saveCliente: (c: Partial<Cliente> & { id?: string }) => string;
  removeCliente: (id: string) => void;
  saveSeguradora: (s: Partial<Seguradora> & { id?: string }) => string;
  removeSeguradora: (id: string) => void;
  saveOficina: (o: Partial<Oficina> & { id?: string }) => string;
  removeOficina: (id: string) => void;

  saveAssistencia: (a: Partial<Assistencia> & { id?: string }) => void;
  removeAssistencia: (id: string) => void;
  concluirAssistencia: (id: string) => void;
  saveSinistro: (s: Partial<Sinistro> & { id?: string }) => void;
  removeSinistro: (id: string) => void;
  resolverSinistro: (id: string) => void;

  getCliente: (id: string) => Cliente | undefined;
  getSeguradora: (id: string) => Seguradora | undefined;
  getOficina: (id: string) => Oficina | undefined;

  globalSearch: (q: string) => SearchResult[];
  resetAll: () => void;
}

const Ctx = createContext<AppContextValue | null>(null);

const PATH_TO_VIEW: Record<string, View> = {
  "/dashboard": "dashboard",
  "/assistencias": "assistencias",
  "/nova-assistencia": "nova-assistencia",
  "/sinistros": "sinistros",
  "/novo-sinistro": "novo-sinistro",
  "/buscar": "buscar",
};

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: "/dashboard",
  assistencias: "/assistencias",
  "nova-assistencia": "/nova-assistencia",
  sinistros: "/sinistros",
  "novo-sinistro": "/novo-sinistro",
  buscar: "/buscar",
};

function viewFromPath(pathname: string): View {
  return PATH_TO_VIEW[pathname] || "dashboard";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [branding, setBrandingState] = useState<Branding>(() => loadBranding());
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));
  const [params, setParams] = useState<NavParams>(() => {
    const search = new URLSearchParams(window.location.search);
    return {
      ...(search.get("q") ? { q: search.get("q")! } : {}),
      ...(search.get("id") ? { id: search.get("id")! } : {}),
    };
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const saveOkRef = useRef(true);

  // ---- Cloud sync state ----
  const [cloudEnabled, setCloudEnabled] = useState<boolean>(isCloudConfigured());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    isCloudConfigured() ? "syncing" : "off",
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(getLastRemoteAt());
  const applyingRemoteRef = useRef(false); // true quando o setData veio da nuvem
  const lastPushedAtRef = useRef<string | null>(getLastRemoteAt());
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudReadyRef = useRef(false); // bloqueia push até o 1º carregamento da nuvem

  const schedulePush = () => {
    if (!isCloudConfigured()) return;
    if (!cloudReadyRef.current) return; // ainda carregando estado da nuvem
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(async () => {
      try {
        setSyncStatus("syncing");
        const at = await saveToCloud(data);
        lastPushedAtRef.current = at;
        setLastRemoteAt(at);
        setLastSyncedAt(at);
        setSyncStatus("live");
      } catch (e) {
        setSyncStatus("error");
        pushToast(
          e instanceof Error ? e.message : "Falha ao sincronizar.",
          "error",
        );
      }
    }, 700);
  };

  // Persistência local sempre; push para nuvem quando configurado
  useEffect(() => {
    const ok = saveData(data);
    if (!ok && saveOkRef.current) {
      saveOkRef.current = false;
      pushToast(
        "Armazenamento cheio. Alguns documentos podem não ter sido salvos.",
        "error",
      );
    } else if (ok) {
      saveOkRef.current = true;
    }
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return; // mudança veio da nuvem — não reenvia
    }
    schedulePush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const pushToast = (message: string, type: Toast["type"] = "info") => {
    const id = uid("t-");
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };
  const notify = pushToast;
  const dismissToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const navigate = (v: View, p: NavParams = {}) => {
    setView(v);
    setParams(p);
    const path = VIEW_TO_PATH[v] || "/dashboard";
    const search = new URLSearchParams();
    if (typeof p.q === "string" && p.q) search.set("q", p.q);
    if (typeof p.id === "string" && p.id) search.set("id", p.id);
    const query = search.toString() ? `?${search.toString()}` : "";
    window.history.pushState({}, "", `${path}${query}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPopState = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setBranding = (b: Partial<Branding>) => {
    setBrandingState((prev) => {
      const next: Branding = { ...prev, ...b };
      saveBranding(next);
      return next;
    });
  };

  // internal log helper
  const addLog = (
    prev: AppData,
    acao: string,
    modulo: string,
    entidadeId: string,
    entidadeNome: string,
    detalhes: string,
  ): AppData => {
    const entry: LogEntry = {
      id: uid("log-"),
      timestamp: nowISO(),
      usuario: "Acesso público",
      acao,
      modulo,
      entidadeId,
      entidadeNome,
      detalhes,
    };
    return { ...prev, logs: [entry, ...prev.logs].slice(0, 500) };
  };

  const log = (
    acao: string,
    modulo: string,
    entidadeId: string,
    entidadeNome: string,
    detalhes: string,
  ) => setData((prev) => addLog(prev, acao, modulo, entidadeId, entidadeNome, detalhes));

  // ----- Usuarios -----
  const saveUsuario = (u: Partial<Usuario> & { id?: string }) => {
    setData((prev) => {
      const existing = prev.usuarios.find((x) => x.id === u.id);
      let usuarios: Usuario[];
      let entId: string;
      let detalhe: string;
      if (existing) {
        usuarios = prev.usuarios.map((x) =>
          x.id === existing.id
            ? { ...x, ...u, updatedAt: nowISO() } as Usuario
            : x,
        );
        entId = existing.id;
        detalhe = `Atualizou usuário ${existing.nome}.`;
      } else {
        const novo: Usuario = {
          id: uid("u-"),
          nome: u.nome || "",
          email: u.email || "",
          senha: u.senha || "",
          papel: u.papel || "Funcionário",
          ativo: u.ativo ?? true,
          excluido: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        usuarios = [novo, ...prev.usuarios];
        entId = novo.id;
        detalhe = `Cadastrou usuário ${novo.nome} (${novo.papel}).`;
      }
      const next = { ...prev, usuarios };
      return addLog(next, existing ? "editou" : "criou", "Usuário", entId, u.nome || existing?.nome || "", detalhe);
    });
    notify("Usuário salvo com sucesso.", "success");
  };

  const removeUsuario = (id: string) => {
    setData((prev) => {
      const target = prev.usuarios.find((u) => u.id === id);
      const usuarios = prev.usuarios.map((u) =>
        u.id === id ? { ...u, excluido: true } : u,
      );
      const next = { ...prev, usuarios };
      return addLog(next, "excluiu", "Usuário", id, target?.nome || "", `Excluiu usuário ${target?.nome}.`);
    });
    notify("Usuário excluído (exclusão lógica).", "info");
  };

  // ----- Clientes -----
  const saveCliente = (c: Partial<Cliente> & { id?: string }): string => {
    const existingOuter = data.clientes.find((x) => x.id === c.id);
    const entId = existingOuter ? existingOuter.id : uid("cli-");
    setData((prev) => {
      const existing = prev.clientes.find((x) => x.id === c.id);
      let clientes: Cliente[];
      let detalhe: string;
      if (existing) {
        clientes = prev.clientes.map((x) =>
          x.id === existing.id ? { ...x, ...c, updatedAt: nowISO() } as Cliente : x,
        );
        detalhe = `Atualizou cliente ${existing.nome}.`;
      } else {
        const novo: Cliente = {
          id: entId,
          nome: c.nome || "",
          documento: c.documento || "",
          telefone: c.telefone || "",
          email: c.email || "",
          endereco: c.endereco || "",
          excluido: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        clientes = [novo, ...prev.clientes];
        detalhe = `Cadastrou cliente ${novo.nome}.`;
      }
      const next = { ...prev, clientes };
      return addLog(next, existing ? "editou" : "criou", "Cliente", entId, c.nome || existing?.nome || "", detalhe);
    });
    notify("Cliente salvo com sucesso.", "success");
    return entId;
  };
  const removeCliente = (id: string) => {
    setData((prev) => {
      const target = prev.clientes.find((c) => c.id === id);
      const clientes = prev.clientes.map((c) =>
        c.id === id ? { ...c, excluido: true } : c,
      );
      const next = { ...prev, clientes };
      return addLog(next, "excluiu", "Cliente", id, target?.nome || "", `Excluiu cliente ${target?.nome}.`);
    });
    notify("Cliente excluído.", "info");
  };

  // ----- Seguradoras -----
  const saveSeguradora = (s: Partial<Seguradora> & { id?: string }): string => {
    const existingOuter = data.seguradoras.find((x) => x.id === s.id);
    const entId = existingOuter ? existingOuter.id : uid("seg-");
    setData((prev) => {
      const existing = prev.seguradoras.find((x) => x.id === s.id);
      let seguradoras: Seguradora[];
      let detalhe: string;
      if (existing) {
        seguradoras = prev.seguradoras.map((x) =>
          x.id === existing.id ? { ...x, ...s, updatedAt: nowISO() } as Seguradora : x,
        );
        detalhe = `Atualizou seguradora ${existing.nome}.`;
      } else {
        const novo: Seguradora = {
          id: entId,
          nome: s.nome || "",
          telefone: s.telefone || "",
          email: s.email || "",
          excluido: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        seguradoras = [novo, ...prev.seguradoras];
        detalhe = `Cadastrou seguradora ${novo.nome}.`;
      }
      const next = { ...prev, seguradoras };
      return addLog(next, existing ? "editou" : "criou", "Seguradora", entId, s.nome || existing?.nome || "", detalhe);
    });
    notify("Seguradora salva com sucesso.", "success");
    return entId;
  };
  const removeSeguradora = (id: string) => {
    setData((prev) => {
      const target = prev.seguradoras.find((s) => s.id === id);
      const seguradoras = prev.seguradoras.map((s) =>
        s.id === id ? { ...s, excluido: true } : s,
      );
      const next = { ...prev, seguradoras };
      return addLog(next, "excluiu", "Seguradora", id, target?.nome || "", `Excluiu seguradora ${target?.nome}.`);
    });
    notify("Seguradora excluída.", "info");
  };

  // ----- Oficinas -----
  const saveOficina = (o: Partial<Oficina> & { id?: string }): string => {
    const existingOuter = data.oficinas.find((x) => x.id === o.id);
    const entId = existingOuter ? existingOuter.id : uid("of-");
    setData((prev) => {
      const existing = prev.oficinas.find((x) => x.id === o.id);
      let oficinas: Oficina[];
      let detalhe: string;
      if (existing) {
        oficinas = prev.oficinas.map((x) =>
          x.id === existing.id ? { ...x, ...o, updatedAt: nowISO() } as Oficina : x,
        );
        detalhe = `Atualizou oficina ${existing.nome}.`;
      } else {
        const novo: Oficina = {
          id: entId,
          nome: o.nome || "",
          telefone: o.telefone || "",
          endereco: o.endereco || "",
          excluido: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        oficinas = [novo, ...prev.oficinas];
        detalhe = `Cadastrou oficina ${novo.nome}.`;
      }
      const next = { ...prev, oficinas };
      return addLog(next, existing ? "editou" : "criou", "Oficina", entId, o.nome || existing?.nome || "", detalhe);
    });
    notify("Oficina salva com sucesso.", "success");
    return entId;
  };
  const removeOficina = (id: string) => {
    setData((prev) => {
      const target = prev.oficinas.find((o) => o.id === id);
      const oficinas = prev.oficinas.map((o) =>
        o.id === id ? { ...o, excluido: true } : o,
      );
      const next = { ...prev, oficinas };
      return addLog(next, "excluiu", "Oficina", id, target?.nome || "", `Excluiu oficina ${target?.nome}.`);
    });
    notify("Oficina excluída.", "info");
  };

  // ----- Assistências -----
  const saveAssistencia = (a: Partial<Assistencia> & { id?: string }) => {
    setData((prev) => {
      const cliente = prev.clientes.find((c) => c.id === a.clienteId);
      const seguradora = prev.seguradoras.find((s) => s.id === a.seguradoraId);
      const existing = prev.assistencias.find((x) => x.id === a.id);
      let assistencias: Assistencia[];
      let entId: string;
      let detalhe: string;
      if (existing) {
        const updated: Assistencia = {
          ...existing,
          ...a,
          clienteNome: a.clienteNome || cliente?.nome || existing.clienteNome,
          seguradoraNome: a.seguradoraNome || seguradora?.nome || existing.seguradoraNome,
          updatedAt: nowISO(),
        } as Assistencia;
        assistencias = prev.assistencias.map((x) =>
          x.id === existing.id ? updated : x,
        );
        entId = existing.id;
        detalhe = `Editou assistência ${existing.protocolo}.`;
      } else {
        const novo: Assistencia = {
          id: uid("ast-"),
          protocolo: a.protocolo || "",
          clienteId: a.clienteId || "",
          clienteNome: a.clienteNome || cliente?.nome || "",
          solicitante: a.solicitante || "",
          telefone: a.telefone || "",
          seguradoraId: a.seguradoraId || "",
          seguradoraNome: a.seguradoraNome || seguradora?.nome || "",
          tipo: a.tipo || "",
          assunto: a.assunto || "",
          descricao: a.descricao || "",
          origem: a.origem || "",
          destino: a.destino || "",
          data: a.data || "",
          horario: a.horario || "",
          observacoes: a.observacoes || "",
          responsavel: a.responsavel || "",
          status: a.status || "Em andamento",
          documentos: a.documentos || [],
          excluido: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        assistencias = [novo, ...prev.assistencias];
        entId = novo.id;
        detalhe = `Abriu assistência ${novo.protocolo} (${novo.clienteNome}).`;
      }
      const next = { ...prev, assistencias };
      return addLog(next, existing ? "editou" : "criou", "Assistência", entId, a.protocolo || existing?.protocolo || "", detalhe);
    });
    notify("Assistência salva com sucesso.", "success");
  };
  const removeAssistencia = (id: string) => {
    setData((prev) => {
      const target = prev.assistencias.find((a) => a.id === id);
      const assistencias = prev.assistencias.map((a) =>
        a.id === id ? { ...a, excluido: true } : a,
      );
      const next = { ...prev, assistencias };
      return addLog(next, "excluiu", "Assistência", id, target?.protocolo || "", `Excluiu assistência ${target?.protocolo}.`);
    });
    notify("Assistência excluída.", "info");
  };
  const concluirAssistencia = (id: string) => {
    setData((prev) => {
      const target = prev.assistencias.find((a) => a.id === id);
      const assistencias = prev.assistencias.map((a) =>
        a.id === id
          ? { ...a, status: "Finalizado" as const, concluidoEm: nowISO(), updatedAt: nowISO() }
          : a,
      );
      const next = { ...prev, assistencias };
      return addLog(next, "concluiu", "Assistência", id, target?.protocolo || "", `Concluiu e moveu ao histórico: ${target?.protocolo}.`);
    });
    notify("Assistência concluída e movida ao histórico.", "success");
  };

  // ----- Sinistros -----
  const saveSinistro = (s: Partial<Sinistro> & { id?: string }) => {
    setData((prev) => {
      const cliente = prev.clientes.find((c) => c.id === s.clienteId);
      const seguradora = prev.seguradoras.find((x) => x.id === s.seguradoraId);
      const oficina = prev.oficinas.find((o) => o.id === s.oficinaId);
      const existing = prev.sinistros.find((x) => x.id === s.id);
      let sinistros: Sinistro[];
      let entId: string;
      let detalhe: string;
      if (existing) {
        const updated: Sinistro = {
          ...existing,
          ...s,
          clienteNome: s.clienteNome || cliente?.nome || existing.clienteNome,
          seguradoraNome: s.seguradoraNome || seguradora?.nome || existing.seguradoraNome,
          oficinaNome: s.oficinaNome || oficina?.nome || existing.oficinaNome,
          updatedAt: nowISO(),
        } as Sinistro;
        sinistros = prev.sinistros.map((x) => (x.id === existing.id ? updated : x));
        entId = existing.id;
        detalhe = `Editou sinistro ${existing.numero}.`;
      } else {
        const novo: Sinistro = {
          id: uid("sin-"),
          numero: s.numero || "",
          categoria: s.categoria || "Automóvel",
          clienteId: s.clienteId || "",
          clienteNome: s.clienteNome || cliente?.nome || "",
          veiculo: s.veiculo || "",
          placa: s.placa || "",
          seguradoraId: s.seguradoraId || "",
          seguradoraNome: s.seguradoraNome || seguradora?.nome || "",
          oficinaId: s.oficinaId || "",
          oficinaNome: s.oficinaNome || oficina?.nome || "",
          data: s.data || "",
          horaOcorrencia: s.horaOcorrencia || "",
          tipoBem: s.tipoBem || "",
          naturezaSinistro: s.naturezaSinistro || "",
          localizacaoSinistro: s.localizacaoSinistro || "",
          descricaoDanos: s.descricaoDanos || "",
          contatoSegurado: s.contatoSegurado || "",
          testemunhas: s.testemunhas || "",
          descricao: s.descricao || "",
          observacoes: s.observacoes || "",
          status: s.status || "Pendente",
          documentos: s.documentos || [],
          excluido: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        sinistros = [novo, ...prev.sinistros];
        entId = novo.id;
        detalhe = `Abriu sinistro ${novo.numero} (${novo.clienteNome}).`;
      }
      const next = { ...prev, sinistros };
      return addLog(next, existing ? "editou" : "criou", "Sinistro", entId, s.numero || existing?.numero || "", detalhe);
    });
    notify("Sinistro salvo com sucesso.", "success");
  };
  const removeSinistro = (id: string) => {
    setData((prev) => {
      const target = prev.sinistros.find((s) => s.id === id);
      const sinistros = prev.sinistros.map((s) =>
        s.id === id ? { ...s, excluido: true } : s,
      );
      const next = { ...prev, sinistros };
      return addLog(next, "excluiu", "Sinistro", id, target?.numero || "", `Excluiu sinistro ${target?.numero}.`);
    });
    notify("Sinistro excluído.", "info");
  };
  const resolverSinistro = (id: string) => {
    setData((prev) => {
      const target = prev.sinistros.find((s) => s.id === id);
      const sinistros = prev.sinistros.map((s) =>
        s.id === id
          ? { ...s, status: "Finalizado" as const, resolvidoEm: nowISO(), updatedAt: nowISO() }
          : s,
      );
      const next = { ...prev, sinistros };
      return addLog(next, "resolveu", "Sinistro", id, target?.numero || "", `Resolveu e moveu ao histórico: ${target?.numero}.`);
    });
    notify("Sinistro resolvido e movido ao histórico.", "success");
  };

  // ----- Lookups -----
  const getCliente = (id: string) => data.clientes.find((c) => c.id === id);
  const getSeguradora = (id: string) =>
    data.seguradoras.find((s) => s.id === id);
  const getOficina = (id: string) => data.oficinas.find((o) => o.id === id);

  // ----- Global search -----
  const globalSearch = useCallback((q: string): SearchResult[] => {
    const term = normalize(q);
    if (term.length < 2) return [];
    const out: SearchResult[] = [];
    for (const a of data.assistencias) {
      if (a.excluido) continue;
      const haystack = normalize(
        `${a.protocolo} ${a.clienteNome} ${a.solicitante} ${a.telefone} ${a.seguradoraNome} ${a.tipo} ${a.assunto} ${a.descricao}`,
      );
      if (haystack.includes(term)) {
        out.push({
          tipo: "Assistência",
          id: a.id,
          titulo: a.protocolo,
          sub: a.clienteNome,
          match: a.tipo || a.assunto,
          status: a.status,
          data: a.data,
        });
      }
    }
    for (const s of data.sinistros) {
      if (s.excluido) continue;
      const haystack = normalize(
        `${s.numero} ${s.categoria || "Automóvel"} ${s.clienteNome} ${s.veiculo} ${s.placa} ${s.tipoBem || ""} ${s.naturezaSinistro || ""} ${s.localizacaoSinistro || ""} ${s.seguradoraNome} ${s.descricao} ${s.descricaoDanos || ""}`,
      );
      if (haystack.includes(term)) {
        out.push({
          tipo: "Sinistro",
          id: s.id,
          titulo: s.numero,
          sub: `${s.clienteNome} • ${s.veiculo}`,
          match: s.placa,
          status: s.status,
          data: s.data,
        });
      }
    }
    return out.slice(0, 30);
  }, [data.assistencias, data.sinistros]);

  // ---- Init: carrega estado da nuvem + assina mudanças em tempo real ----
  useEffect(() => {
    if (!isCloudConfigured()) {
      cloudReadyRef.current = true;
      setSyncStatus("off");
      return;
    }
    let cancelled = false;
    setSyncStatus("syncing");

    loadFromCloud()
      .then((rec) => {
        if (cancelled) return;
        if (rec) {
          lastPushedAtRef.current = rec.updated_at;
          setLastRemoteAt(rec.updated_at);
          setLastSyncedAt(rec.updated_at);
          applyingRemoteRef.current = true;
          setData(rec.data);
          cloudReadyRef.current = true;
          setSyncStatus("live");
        } else {
          // Nuvem vazia: envia o estado local atual (bootstrap)
          cloudReadyRef.current = true;
          setSyncStatus("live");
          void saveToCloud(data)
            .then((at) => {
              lastPushedAtRef.current = at;
              setLastRemoteAt(at);
              setLastSyncedAt(at);
            })
            .catch((e) => {
              setSyncStatus("error");
              pushToast(
                e instanceof Error ? e.message : "Falha no envio inicial.",
                "error",
              );
            });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        cloudReadyRef.current = true; // permite tentar sincronizar edições futuras
        setSyncStatus("error");
        pushToast(
          e instanceof Error ? e.message : "Falha ao carregar dados da nuvem.",
          "error",
        );
      });

    const unsub = subscribeToCloud(
      (rec) => {
        // ignora o eco da nossa própria escrita
        if (lastPushedAtRef.current && rec.updated_at === lastPushedAtRef.current) {
          return;
        }
        lastPushedAtRef.current = rec.updated_at;
        setLastRemoteAt(rec.updated_at);
        setLastSyncedAt(rec.updated_at);
        applyingRemoteRef.current = true;
        setData(rec.data);
        setSyncStatus("live");
      },
      () => setSyncStatus("error"),
    );

    return () => {
      cancelled = true;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudEnabled]);

  const saveCloudConfigAction = async (c: CloudConfig) => {
    const res = await testConnection(c);
    if (!res.ok) return res;
    saveCloudConfig(c);
    resetClient();
    setCloudEnabled(true);
    setSyncStatus("syncing");
    notify("Sincronização ativada. Recarregando...", "success");
    setTimeout(() => window.location.reload(), 900);
    return { ok: true, msg: "Configurado!" };
  };

  const disconnectCloud = () => {
    saveCloudConfig(null);
    setLastRemoteAt(null);
    resetClient();
    setCloudEnabled(false);
    setSyncStatus("off");
    setLastSyncedAt(null);
    notify("Sincronização desativada — modo local.", "info");
  };

  const cloudWorkspace = cloudEnabled
    ? loadCloudConfig()?.workspace || null
    : null;

  const resetAll = () => {
    const fresh = resetData();
    setData(fresh); // dispara push para propagar o reset a todos os clientes
    notify("Dados restaurados para o estado inicial.", "info");
  };

  const value: AppContextValue = {
    data,
    usuarios: data.usuarios.filter((u) => !u.excluido),
    clientes: data.clientes.filter((c) => !c.excluido),
    seguradoras: data.seguradoras.filter((s) => !s.excluido),
    oficinas: data.oficinas.filter((o) => !o.excluido),
    assistencias: data.assistencias.filter((a) => !a.excluido),
    sinistros: data.sinistros.filter((s) => !s.excluido),
    logs: data.logs,
    view,
    params,
    navigate,
    branding,
    setBranding,
    cloudEnabled,
    syncStatus,
    cloudWorkspace,
    lastSyncedAt,
    saveCloudConfigAction,
    disconnectCloud,
    toasts,
    notify,
    dismissToast,
    log,
    saveUsuario,
    removeUsuario,
    saveCliente,
    removeCliente,
    saveSeguradora,
    removeSeguradora,
    saveOficina,
    removeOficina,
    saveAssistencia,
    removeAssistencia,
    concluirAssistencia,
    saveSinistro,
    removeSinistro,
    resolverSinistro,
    getCliente,
    getSeguradora,
    getOficina,
    globalSearch,
    resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
