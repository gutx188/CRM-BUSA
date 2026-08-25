import type { CSSProperties } from "react";
import { useApp } from "@/store/AppStore";
import { cn } from "@/utils/cn";

/**
 * Exibe a logo da corretora (quando cadastrada) ou um ícone padrão.
 */
export function BrandLogo({
  size = 40,
  rounded = "rounded-xl",
  className,
}: {
  size?: number;
  rounded?: string;
  className?: string;
}) {
  const { branding } = useApp();

  if (branding.logoUrl) {
    return (
      <img
        src={branding.logoUrl}
        alt="Logo da corretora"
        style={{ height: size, width: size } as CSSProperties}
        className={cn(
          "object-contain bg-white/5 ring-1 ring-white/10 p-1",
          rounded,
          className,
        )}
      />
    );
  }

  return (
    <div
      style={{ height: size, width: size } as CSSProperties}
      className={cn(
        "grid place-items-center bg-gradient-to-br from-[#0a2a4a] to-[#05101f] ring-1 ring-[#1ba3e0]/25 shadow-lg shadow-[#05101f]/60",
        rounded,
        className,
      )}
    >
      <img
        src="/busa-logo.png"
        alt="Logo Busa Corretora de Seguros"
        style={{ height: size * 0.68, width: size * 0.68 } as CSSProperties}
        className="object-contain"
      />
    </div>
  );
}

/**
 * Nome da corretora com estilo, dividindo a última palavra em destaque.
 */
export function BrandName({
  className,
  accentClassName = "text-[#29b6f0]",
}: {
  className?: string;
  accentClassName?: string;
}) {
  const { branding } = useApp();
  const name = branding.brokerName || "Busa Seguros";
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) {
    return <span className={className}>{name}</span>;
  }
  const head = parts.slice(0, -1).join(" ");
  const tail = parts[parts.length - 1];
  return (
    <span className={className}>
      {head} <span className={accentClassName}>{tail}</span>
    </span>
  );
}
