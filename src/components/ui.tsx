import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/utils/cn";
import { IconAlert, IconCheckCircle, IconClose, IconInbox } from "./Icons";

// ---------------- Button ----------------
type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-violet-500 to-violet-600 text-white hover:from-violet-400 hover:to-violet-500 shadow-lg shadow-violet-900/30 border border-violet-400/20",
  secondary:
    "bg-elevated text-slate-100 hover:bg-hover border border-line",
  ghost: "text-muted hover:text-white hover:bg-hover",
  outline: "border border-line text-slate-200 hover:bg-hover hover:border-line",
  danger:
    "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/25",
  success:
    "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 whitespace-nowrap",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------------- Field ----------------
export function Field({
  label,
  error,
  required,
  hint,
  children,
  className,
}: {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-faint">{hint}</p>}
      {error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
          <IconAlert className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "w-full bg-surface border border-line rounded-xl px-3.5 text-sm text-slate-100 placeholder:text-faint transition-colors focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 disabled:opacity-60";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(inputBase, "py-2.5 min-h-[84px] resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          inputBase,
          "h-11 appearance-none pr-9 cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

// ---------------- Status chip ----------------
export function StatusChip({
  dot,
  chip,
  label,
  className,
}: {
  dot?: string;
  chip?: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        chip || "bg-elevated text-slate-300 border-line",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot || "bg-slate-400")} />
      {label}
    </span>
  );
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-elevated px-2 py-0.5 text-[11px] font-medium text-muted border border-line",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------------- Card / Panel ----------------
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line-soft bg-card shadow-xl shadow-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---------------- Empty state ----------------
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line py-14 px-6 text-center animate-fade-in">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-elevated text-faint">
        {icon || <IconInbox className="w-7 h-7" />}
      </div>
      <div>
        <p className="font-semibold text-slate-200">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted max-w-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ---------------- Modal ----------------
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const maxW = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl border border-line bg-card shadow-2xl animate-scale-in sm:max-h-[calc(100vh-3rem)]",
          maxW,
        )}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
            <div className="flex items-center gap-2.5">
              {icon && (
                <span className="text-violet-300">{icon}</span>
              )}
              <h3 className="text-base font-bold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-hover hover:text-white transition-colors"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ---------------- Confirm dialog ----------------
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full",
            variant === "danger"
              ? "bg-rose-500/10 text-rose-400"
              : "bg-violet-500/10 text-violet-300",
          )}
        >
          <IconAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-muted -mt-1">{message}</p>
        <div className="mt-2 flex w-full gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            className="flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------- Toaster ----------------
export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: { id: string; message: string; type: string }[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl animate-slide-up backdrop-blur",
            t.type === "success" &&
              "bg-emerald-950/90 border-emerald-500/30 text-emerald-100",
            t.type === "error" && "bg-rose-950/90 border-rose-500/30 text-rose-100",
            t.type === "info" && "bg-elevated/95 border-line text-slate-100",
          )}
        >
          <span className="mt-0.5">
            {t.type === "success" && <IconCheckCircle className="w-5 h-5 text-emerald-400" />}
            {t.type === "error" && <IconAlert className="w-5 h-5 text-rose-400" />}
            {t.type === "info" && <IconInfo className="w-5 h-5 text-violet-300" />}
          </span>
          <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-current opacity-50 hover:opacity-100"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// I needed an Info icon; alias defined below
function IconInfo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}
