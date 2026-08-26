// Utility helpers

export { cn } from "../utils/cn";

export const uid = (prefix = ""): string =>
  prefix +
  Date.now().toString(36) +
  Math.random().toString(36).slice(2, 8);

export const nowISO = (): string => new Date().toISOString();

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function formatTime(iso?: string): string {
  if (!iso) return "";
  // for HH:MM strings
  if (/^\d{2}:\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function tempoRelativo(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "—";
  const diff = Date.now() - d;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d atrás`;
  return formatDate(iso);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function onlyDigits(s: string): string {
  return (s || "").replace(/\D/g, "");
}

export function isValidPhone(s: string): boolean {
  const d = onlyDigits(s);
  return d.length >= 10 && d.length <= 11;
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());
}

export function isValidPlaca(s: string): boolean {
  // Mercosul or old format
  const v = (s || "").toUpperCase().trim();
  return /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/.test(v) || /^[A-Z]{3}[0-9]{4}$/.test(v);
}

export function formatPlaca(s: string): string {
  return (s || "").toUpperCase().trim();
}

// Flatten an object's values into a searchable string
export function normalize(s: string): string {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const todayISODate = (): string => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
};
