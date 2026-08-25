import { useApp } from "@/store/AppStore";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/utils/cn";
import { BrandLogo, BrandName } from "./Brand";

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const { view, navigate, branding } = useApp();
  const brokerTagline = branding.brokerTagline;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-line-soft bg-surface transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-line-soft px-5">
          <BrandLogo size={40} />
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-white">
              <BrandName />
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-faint">
              {brokerTagline}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => {
            const items = section.items;
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const active = view === item.view;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.view}
                        onClick={() => {
                          navigate(item.view);
                          onClose();
                        }}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-gradient-to-r from-violet-500/15 to-transparent text-white"
                            : "text-muted hover:bg-hover hover:text-slate-100",
                        )}
                      >
                        <span
                          className={cn(
                            "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-violet-500/20 text-violet-300"
                              : "text-faint group-hover:text-slate-200",
                          )}
                        >
                          {active && (
                            <span className="absolute -left-3 top-1/2 h-5 -translate-y-1/2 rounded-full border-l-2 border-violet-400" />
                          )}
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-line-soft p-3">
          <div className="rounded-xl border border-brand/15 bg-brand/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand2">
              Acesso público
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Este painel funciona localmente e pode ser acessado por qualquer pessoa com o link.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
