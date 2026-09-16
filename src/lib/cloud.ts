import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AppData } from "./types";
import type { Branding } from "./db";

export interface CloudConfig { url: string; anonKey: string; workspace: string }
export interface CloudRecord { workspace: string; data: AppData; branding: Branding; updated_at: string }
export type SyncStatus = "off" | "syncing" | "live" | "error";

let client: SupabaseClient | null = null;
const LAST_REMOTE_KEY = "seguros_crm_last_remote_v1";

export function getClient() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Supabase não está configurado neste ambiente.");
    client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  }
  return client;
}

export function isCloudConfigured() { return Boolean(import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL); }
export function loadCloudConfig(): CloudConfig | null {
  if (!isCloudConfigured()) return null;
  return { url: import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL, anonKey: "", workspace: "workspace-pessoal" };
}
export function saveCloudConfig(_config: CloudConfig | null) {}
export function getLastRemoteAt() { return localStorage.getItem(LAST_REMOTE_KEY); }
export function setLastRemoteAt(iso: string | null) { if (iso) localStorage.setItem(LAST_REMOTE_KEY, iso); else localStorage.removeItem(LAST_REMOTE_KEY); }
export function resetClient() { client = null; }

async function currentUser(): Promise<User> {
  const { data, error } = await getClient().auth.getUser();
  if (error || !data.user) throw new Error("Sua sessão expirou. Entre novamente.");
  return data.user;
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return ["usuarios", "clientes", "seguradoras", "oficinas", "assistencias", "sinistros", "logs"].every(
    (key) => Array.isArray(record[key]),
  );
}

function parseRemoteData(value: unknown): AppData {
  if (!isAppData(value)) throw new Error("Os dados da nuvem estão inválidos ou corrompidos.");
  return value;
}

export async function loadFromCloud(): Promise<CloudRecord | null> {
  const user = await currentUser();
  const { data, error } = await getClient().from("crm_workspaces").select("user_id,data,branding,updated_at").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Não foi possível carregar os dados da nuvem.");
  return data ? { workspace: user.id, data: parseRemoteData(data.data), branding: (data.branding || {}) as Branding, updated_at: data.updated_at } : null;
}

export async function saveToCloud(data: AppData, branding?: Branding): Promise<string> {
  const user = await currentUser();
  const existing = await getClient().from("crm_workspaces").select("branding").eq("user_id", user.id).maybeSingle();
  if (existing.error) throw new Error("Não foi possível preparar a sincronização.");
  const updated_at = new Date().toISOString();
  const result = await getClient().from("crm_workspaces").upsert({ user_id: user.id, data, branding: branding || existing.data?.branding || {}, updated_at }, { onConflict: "user_id" });
  if (result.error) throw new Error("Não foi possível salvar os dados na nuvem.");
  return updated_at;
}

export function subscribeToCloud(onChange: (record: CloudRecord) => void, onError?: (message: string) => void) {
  const channel = getClient().channel("crm-workspace").on("postgres_changes", { event: "UPDATE", schema: "public", table: "crm_workspaces" }, async (payload) => {
    try {
      const user = await currentUser();
      if (payload.new.user_id !== user.id) return;
      onChange({ workspace: user.id, data: parseRemoteData(payload.new.data), branding: (payload.new.branding || {}) as Branding, updated_at: payload.new.updated_at });
    } catch { onError?.("Não foi possível atualizar a sincronização."); }
  }).subscribe((status) => { if (status === "CHANNEL_ERROR") onError?.("Falha no canal de sincronização."); });
  return () => { void getClient().removeChannel(channel); };
}

export async function testConnection(_config: CloudConfig) { try { await currentUser(); return { ok: true, msg: "Conexão Supabase ativa." }; } catch (e) { return { ok: false, msg: e instanceof Error ? e.message : "Falha na conexão." }; } }
export const SETUP_SQL = "";

export async function signOut() { await getClient().auth.signOut(); }
export function onAuthStateChange(callback: (user: User | null) => void) { return getClient().auth.onAuthStateChange((_event, session) => callback(session?.user ?? null)); }
export async function getCurrentUser() { const { data } = await getClient().auth.getSession(); return data.session?.user ?? null; }
export async function signIn(email: string, password: string) { return getClient().auth.signInWithPassword({ email, password }); }
export async function signUp(email: string, password: string, name: string) {
  return getClient().auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
    },
  });
}

export type { Branding };

export function saveBrandingToCloud(data: AppData, branding: Branding) { return saveToCloud(data, branding); }
