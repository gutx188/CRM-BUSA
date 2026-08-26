import { useState, type ReactNode } from "react";
import { useApp } from "@/store/AppStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toaster } from "./ui";

export function Layout({ children }: { children: ReactNode }) {
  const { toasts, dismissToast, view } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative lg:pl-[270px]">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <div key={view} className="animate-slide-up">
            {children}
          </div>
        </main>
      </div>
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
