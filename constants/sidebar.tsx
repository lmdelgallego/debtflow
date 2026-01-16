import { SidebarLink } from "@/types";
import { CreditCard, DollarSign, HandCoins, LayoutDashboard } from "lucide-react";

export const sidebarLinks: SidebarLink[] = [
  {
    title: 'Dashboard',
    route: '/dashboard',
    icon: <LayoutDashboard />,
  },
  {
    title: 'Ingresos',
    route: '/incomes',
    icon: <DollarSign />,
  },
  {
    title: 'Gastos',
    route: '/expenses',
    icon: <CreditCard />,
  },
  {
    title: 'Deudas',
    route: '/debts',
    icon: <HandCoins />,
  },
];