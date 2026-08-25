import type { AppData } from "./types";
import {
  checkPocketBase,
  getPocketBaseConfig,
  isPocketBaseSyncEnabled,
  loadPocketBaseData,
  savePocketBaseData,
} from "./pocketbase";

/**
 * Compatibilidade com o estado original do projeto.
 *
 * A versão pública usa o armazenamento local do navegador por padrão.
 * Mantemos a mesma interface para que o estado da aplicação continue simples
 * de evoluir, mas não exigimos conta ou serviço externo para usar o painel.
 */

export interface CloudConfig {
  url: string;
  anonKey: string;
  workspace: string;
}

export interface CloudRecord {
  workspace: string;
  data: AppData;
  updated_at: string;
}

export type SyncStatus = "off" | "syncing" | "live" | "error";

export function loadCloudConfig(): CloudConfig | null {
  if (!isPocketBaseSyncEnabled()) return null;
  const config = getPocketBaseConfig();
  if (!config) return null;
  return { url: config.url, anonKey: "", workspace: config.workspace };
}

export function saveCloudConfig(_config: CloudConfig | null): void {
  // A configuração é feita por ambiente e não pelo navegador.
}

export function isCloudConfigured(): boolean {
  return isPocketBaseSyncEnabled();
}

export function getLastRemoteAt(): string | null {
  return null;
}

export function setLastRemoteAt(_iso: string | null): void {
  // O modo local não mantém timestamp remoto.
}

export function resetClient(): void {
  // Mantido para compatibilidade com o store legado.
}

export function getClient(): null {
  return null;
}

export async function loadFromCloud(): Promise<CloudRecord | null> {
  const record = await loadPocketBaseData();
  return record
    ? { workspace: getPocketBaseConfig()?.workspace || "", data: record.data, updated_at: record.updated_at }
    : null;
}

export async function saveToCloud(data: AppData): Promise<string> {
  return savePocketBaseData(data);
}

export function subscribeToCloud(
  _onChange: (record: CloudRecord) => void,
  _onError?: (message: string) => void,
): () => void {
  return () => {};
}

export async function testConnection(
  _config: CloudConfig,
): Promise<{ ok: boolean; msg: string }> {
  if (!isPocketBaseSyncEnabled()) {
    return {
      ok: false,
      msg: "A sincronização continua desativada. Ela só é habilitada por ambiente.",
    };
  }
  const result = await checkPocketBase();
  return { ok: result.ok, msg: result.message };
}

export const SETUP_SQL = "";