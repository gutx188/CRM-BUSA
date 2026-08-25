import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "violet",
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: "violet" | "sky" | "amber" | "emerald" | "rose" | "cyan";
  onClick?: () => void;
}) {
  const accents: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-500/0 text-violet-300",
    sky: "from-sky-500/20 to-sky-500/0 text-sky-300",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-300",
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-300",
    rose: "from-rose-500/20 to-rose-500/0 text-rose-300",
    cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-300",
  };
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line-soft bg-card p-4 text-left shadow-lg shadow-black/20 transition-all",
        onClick && "hover:-translate-y-0.5 hover:border-violet-500/30",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl transition-opacity group-hover:opacity-100",
          accents[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white tabular-nums">
            {value}
          </p>
          {sub && <p className="mt-1 text-[11px] text-faint">{sub}</p>}
        </div>
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br",
            accents[accent],
          )}
        >
          {icon}
        </div>
      </div>
    </button>
  );
}

export function InfoRow({
  icon,
  label,
  children,
  className,
}: {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      {icon && <span className="text-faint shrink-0">{icon}</span>}
      <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}:
      </span>
      <span className="truncate text-sm font-medium text-slate-200">
        {children}
      </span>
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line-soft bg-card shadow-lg shadow-black/20",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5">
        <div className="flex items-center gap-2">
          {icon && <span className="text-violet-300">{icon}</span>}
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
