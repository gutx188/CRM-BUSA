import { useState } from "react";
import { useApp } from "@/store/AppStore";
import { VIEW_TITLES } from "@/lib/nav";
import { Button } from "./ui";
import { IconMenu, IconPlusAssist, IconPlusCar, IconSearch } from "./Icons";

export function Topbar({
  onMenu,
}: {
  onMenu: () => void;
}) {
  const { view, navigate } = useApp();
  const [q, setQ] = useState("");
  const meta = VIEW_TITLES[view];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("buscar", { q });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line-soft bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-hover hover:text-white lg:hidden"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      <div className="hidden min-w-0 sm:block">
        <h2 className="truncate text-base font-bold text-white">{meta.title}</h2>
        <p className="truncate text-[11px] text-muted">{meta.subtitle}</p>
      </div>

      <form onSubmit={submitSearch} className="ml-auto hidden md:block">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar protocolo, sinistro, placa, bem..."
            className="h-10 w-[300px] rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-slate-100 placeholder:text-faint focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/15 lg:w-[360px]"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2 md:ml-2">
        <Button
          variant="secondary"
          size="md"
          className="hidden sm:inline-flex"
          onClick={() => navigate("nova-assistencia")}
        >
          <IconPlusAssist className="h-[18px] w-[18px]" />
          <span className="hidden lg:inline">Assistência</span>
        </Button>
        <Button size="md" onClick={() => navigate("novo-sinistro")}>
          <IconPlusCar className="h-[18px] w-[18px]" />
          <span className="hidden lg:inline">Sinistro</span>
        </Button>
      </div>
    </header>
  );
}
