import { FormEvent, useEffect, useState } from "react";
import { getClient, getCurrentUser, onAuthStateChange, signIn, signUp } from "@/lib/cloud";
import { Button, Input } from "./ui";
import { BrandLogo, BrandName } from "./Brand";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Awaited<ReturnType<typeof getCurrentUser>>>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false));
    const { data } = onAuthStateChange(setUser);
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = mode === "login" ? await signIn(email.trim(), password) : await signUp(email.trim(), password, name.trim());
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) setError("Cadastro realizado. Verifique seu e-mail para confirmar a conta.");
      else setUser(result.data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível concluir o acesso.";
      if (/email not confirmed|confirm your email/i.test(message)) setError("Confirme seu e-mail antes de entrar.");
      else if (/weak password|password should/i.test(message)) setError("A senha precisa ter pelo menos 6 caracteres.");
      else if (/rate limit|too many requests/i.test(message)) setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      else setError("Não foi possível concluir o acesso. Verifique os dados e tente novamente.");
    } finally { setBusy(false); }
  }

  if (checking) return <div className="grid min-h-screen place-items-center bg-bg text-sm text-faint">Verificando sessão...</div>;
  if (user) return <>{children}</>;

  return <main className="grid min-h-screen place-items-center bg-bg px-4 text-slate-100">
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-2xl shadow-black/30">
      <div className="mb-7 flex flex-col items-center text-center"><BrandLogo size={56} rounded="rounded-2xl" /><h1 className="mt-3 text-xl font-bold text-white"><BrandName /></h1><p className="mt-1 text-sm text-faint">Acesse seu CRM com segurança</p></div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />}
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" minLength={6} required />
        {error && <p role="alert" className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">{error}</p>}
        <Button className="w-full justify-center" type="submit" disabled={busy}>{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}</Button>
      </form>
      <button className="mt-5 w-full text-center text-xs font-semibold text-violet-300 hover:text-violet-200" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
        {mode === "login" ? "Ainda não tenho uma conta" : "Já tenho uma conta"}
      </button>
    </div>
  </main>;
}

export function SupabaseHealthcheck() { return getClient(); }
