import { AppProvider, useApp } from "@/store/AppStore";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { AssistenciaForm } from "@/pages/AssistenciaForm";
import { Assistencias } from "@/pages/Assistencias";
import { SinistroForm } from "@/pages/SinistroForm";
import { Sinistros } from "@/pages/Sinistros";
import { Buscar } from "@/pages/Buscar";
import { Relatorio } from "@/pages/Relatorio";

function CurrentView() {
  const { view } = useApp();

  switch (view) {
    case "dashboard":
      return <Dashboard />;
    case "nova-assistencia":
      return <AssistenciaForm />;
    case "assistencias":
      return <Assistencias />;
    case "novo-sinistro":
      return <SinistroForm />;
    case "sinistros":
      return <Sinistros />;
    case "buscar":
      return <Buscar />;
    case "relatorio":
      return <Relatorio />;
    default:
      return <Dashboard />;
  }
}

function Shell() {
  return (
    <Layout>
      <CurrentView />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
