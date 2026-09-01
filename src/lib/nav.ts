import type { ComponentType } from "react";
import type { View } from "./types";
import {
  IconDashboard,
  IconPlusAssist,
  IconListAssist,
  IconPlusCar,
  IconCar,
  IconSearch,
  IconDoc,
} from "@/components/Icons";

export interface NavItem {
  view: View;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Principal",
    items: [
      { view: "dashboard", label: "Dashboard", icon: IconDashboard },
    ],
  },
  {
    title: "Assistências",
    items: [
      { view: "nova-assistencia", label: "Nova Assistência", icon: IconPlusAssist },
      { view: "assistencias", label: "Assistências", icon: IconListAssist },
    ],
  },
  {
    title: "Sinistros",
    items: [
      { view: "novo-sinistro", label: "Novo Sinistro", icon: IconPlusCar },
      { view: "sinistros", label: "Sinistros", icon: IconCar },
    ],
  },
  {
    title: "Operação",
    items: [
      { view: "buscar", label: "Buscar", icon: IconSearch },
      { view: "relatorio", label: "Relatório", icon: IconDoc },
    ],
  },
];

export const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral das operações" },
  "nova-assistencia": { title: "Nova Assistência", subtitle: "Abertura de protocolo de assistência" },
  assistencias: { title: "Assistências", subtitle: "Acompanhamento de assistências em curso" },
  "novo-sinistro": { title: "Novo Sinistro", subtitle: "Abertura de sinistro" },
  sinistros: { title: "Sinistros", subtitle: "Gestão de sinistros" },
  buscar: { title: "Busca Global", subtitle: "Pesquisar em todo o sistema" },
  relatorio: { title: "Relatório de Assistências", subtitle: "Resumo geral e busca detalhada com filtros" },
  clientes: { title: "Dashboard", subtitle: "Visão geral das operações" },
  seguradoras: { title: "Dashboard", subtitle: "Visão geral das operações" },
  oficinas: { title: "Dashboard", subtitle: "Visão geral das operações" },
  usuarios: { title: "Dashboard", subtitle: "Visão geral das operações" },
  logs: { title: "Dashboard", subtitle: "Visão geral das operações" },
};
