import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { STATUS_ASSISTENCIA, STATUS_SINISTRO } from "@/lib/constants";
import { formatDate, formatPlaca } from "@/lib/utils";
import { StatusChip, EmptyState, PageHeader } from "@/components/ui";
import {
  IconSearch,
  IconListAssist,
  IconCar,
  IconChevronRight,
} from "@/components/Icons";

export function Buscar() {
  const { params, globalSearch, navigate } = useApp();
  const [query, setQuery] = useState<string>((params.q as string) || "");

  const results = useMemo(() => globalSearch(query), [globalSearch, query]);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Busca Global"
        subtitle="Pesquise por cliente, placa, protocolo ou sinistro"
        icon={<IconSearch className="h-5 w-5" />}
      />

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite para buscar em todo o sistema..."
          className="h-14 w-full rounded-2xl border border-line bg-card pl-12 pr-4 text-base font-medium text-white placeholder:text-faint shadow-lg shadow-black/20 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
        />
      </div>

      {query.trim().length < 2 ? (
        <EmptyState
          icon={<IconSearch className="w-7 h-7" />}
          title="Busque em todos os módulos"
          description="Resultados de assistências e sinistros aparecem aqui em tempo real."
        />
      ) : (
        <div className="space-y-5">
          {results.length === 0 && (
            <EmptyState
              icon={<IconSearch className="w-7 h-7" />}
              title="Nenhum resultado encontrado"
              description={`Nada corresponde a "${query}".`}
            />
          )}

          {results.length > 0 && (
            <div className="grid gap-3">
              {results.map((r) => {
                const isAssist = r.tipo === "Assistência";
                const cfg = isAssist
                  ? STATUS_ASSISTENCIA[r.status as keyof typeof STATUS_ASSISTENCIA]
                  : STATUS_SINISTRO[r.status as keyof typeof STATUS_SINISTRO];
                return (
                  <button
                    key={r.tipo + r.id}
                    onClick={() =>
                      navigate(
                        isAssist ? "nova-assistencia" : "novo-sinistro",
                        { id: r.id },
                      )
                    }
                    className="flex items-center gap-3 rounded-xl border border-line-soft bg-card px-4 py-3 text-left transition-colors hover:bg-hover"
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-lg ${
                        isAssist
                          ? "bg-violet-500/10 text-violet-300"
                          : "bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {isAssist ? (
                        <IconListAssist className="h-4 w-4" />
                      ) : (
                        <IconCar className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {r.titulo}
                        </p>
                        <StatusChip label={cfg.label} dot={cfg.dot} chip={cfg.chip} />
                        <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted">
                          {r.tipo}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted">
                        {r.sub} · {isAssist ? r.match : `Placa ${formatPlaca(r.match)}`} ·{" "}
                        {formatDate(r.data)}
                      </p>
                    </div>
                    <IconChevronRight className="h-4 w-4 text-faint" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

