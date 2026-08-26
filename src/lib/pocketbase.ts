import type { AppData } from "./types";

/**
 * Adaptador REST preparado para o PocketBase.
 *
 * Este módulo não ativa sincronização sozinho. A ativação exige:
 *   VITE_POCKETBASE_URL=https://...
 *   VITE_ENABLE_POCKETBASE_SYNC=true
 *
 * Nenhuma credencial administrativa deve ser colocada em variáveis VITE_:
 * tudo que começa com VITE_ é enviado para o navegador.
 */

export const DEFAULT_POCKETBASE_COLLECTION = "crm_workspaces";
export const DEFAULT_POCKETBASE_WORKSPACE = "crm-corretora";

export interface PocketBaseConfig {
  url: string;
  collection: string;
  workspace: string;
}

export interface PocketBaseRecord {
  id: string;
  workspace: string;
  payload: AppData;
  created: string;
  updated: string;
}

interface PocketBaseList<T> {
  items: T[];
}

function cleanUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function envValue(name: string): string {
  return String(import.meta.env[name] ?? "").trim();
}

export function getPocketBaseConfig(): PocketBaseConfig | null {
  const url = cleanUrl(envValue("VITE_POCKETBASE_URL"));
  if (!url) return null;

  return {
    url,
    collection:
      envValue("VITE_POCKETBASE_COLLECTION") ||
      DEFAULT_POCKETBASE_COLLECTION,
    workspace:
      envValue("VITE_POCKETBASE_WORKSPACE") ||
      DEFAULT_POCKETBASE_WORKSPACE,
  };
}

export function isPocketBasePrepared(): boolean {
  return getPocketBaseConfig() !== null;
}

export function isPocketBaseSyncEnabled(): boolean {
  return (
    isPocketBasePrepared() &&
    envValue("VITE_ENABLE_POCKETBASE_SYNC").toLowerCase() === "true"
  );
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<AppData>;
  return (
    Array.isArray(data.usuarios) &&
    Array.isArray(data.clientes) &&
    Array.isArray(data.seguradoras) &&
    Array.isArray(data.oficinas) &&
    Array.isArray(data.assistencias) &&
    Array.isArray(data.sinistros) &&
    Array.isArray(data.logs)
  );
}

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function pocketBaseError(status: number, body: string): Error {
  let detail = body;
  try {
    const parsed = JSON.parse(body) as { message?: string };
    detail = parsed.message || body;
  } catch {
    // Mantém a resposta textual quando não for JSON.
  }
  return new Error(`PocketBase (${status}): ${detail || "resposta inválida"}`);
}

async function request<T>(
  config: PocketBaseConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw pocketBaseError(response.status, await response.text());
  }
  return (await response.json()) as T;
}

async function findWorkspaceRecord(
  config: PocketBaseConfig,
): Promise<PocketBaseRecord | null> {
  const filter = encodeURIComponent(
    `workspace = "${escapeFilterValue(config.workspace)}"`,
  );
  const result = await request<PocketBaseList<PocketBaseRecord>>(
    config,
    `/api/collections/${encodeURIComponent(config.collection)}/records?filter=${filter}&perPage=1`,
  );
  const record = result.items[0];
  if (!record) return null;
  if (!isAppData(record.payload)) {
    throw new Error("O registro do PocketBase não contém um payload válido.");
  }
  return record;
}

export async function checkPocketBase(
  config = getPocketBaseConfig(),
): Promise<{ ok: boolean; message: string }> {
  if (!config) {
    return {
      ok: false,
      message: "Defina VITE_POCKETBASE_URL para testar o PocketBase.",
    };
  }

  try {
    await request<{ code: number }>(config, "/api/health");
    return { ok: true, message: "PocketBase respondeu corretamente." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível alcançar o PocketBase.",
    };
  }
}

export async function loadPocketBaseData(
  config = getPocketBaseConfig(),
): Promise<{ data: AppData; updated_at: string } | null> {
  if (!config) return null;
  const record = await findWorkspaceRecord(config);
  if (!record) return null;
  return { data: record.payload, updated_at: record.updated };
}

export async function savePocketBaseData(
  data: AppData,
  config = getPocketBaseConfig(),
): Promise<string> {
  if (!config) {
    throw new Error("PocketBase não está configurado.");
  }

  const collectionPath = `/api/collections/${encodeURIComponent(config.collection)}/records`;
  const existing = await findWorkspaceRecord(config);
  const body = JSON.stringify({ workspace: config.workspace, payload: data });
  const record = existing
    ? await request<PocketBaseRecord>(
        config,
        `${collectionPath}/${encodeURIComponent(existing.id)}`,
        { method: "PATCH", body },
      )
    : await request<PocketBaseRecord>(config, collectionPath, {
        method: "POST",
        body,
      });

  return record.updated || new Date().toISOString();
}