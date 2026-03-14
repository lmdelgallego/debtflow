import { SidebarLink } from "@/types";
import { CreditCard, DollarSign, HandCoins, LayoutDashboard } from "lucide-react";

export const sidebarLinks: SidebarLink[] = [
  {
    title: 'Dashboard',
    route: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    color: 'primary',
  },
  {
    title: 'Ingresos',
    route: '/incomes',
    icon: <DollarSign size={20} />,
    color: 'income',
  },
  {
    title: 'Gastos',
    route: '/expenses',
    icon: <CreditCard size={20} />,
    color: 'expense',
  },
  {
    title: 'Deudas',
    route: '/debts',
    icon: <HandCoins size={20} />,
    color: 'debt',
  },
];
