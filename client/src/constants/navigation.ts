import {
  LayoutDashboard,
  History,
  Receipt,
  Wallet,
  PiggyBank,
  ChartColumn,
  User,
  Settings,
} from "lucide-react";
import type { ElementType } from "react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: ElementType;
}

export const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "History",
    path: "/history",
    icon: History,
  },
  {
    label: "Receipts",
    path: "/receipts",
    icon: Receipt,
  },
  {
    label: "Budgets",
    path: "/budgets",
    icon: Wallet,
  },
  {
    label: "Savings Goals",
    path: "/savings",
    icon: PiggyBank,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: ChartColumn,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];
