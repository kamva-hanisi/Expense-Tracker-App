export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const navigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: "LayoutDashboard",
  },
  {
    label: "History",
    path: "/history",
    icon: "History",
  },
  {
    label: "Receipts",
    path: "/receipts",
    icon: "Receipt",
  },
  {
    label: "Budgets",
    path: "/budgets",
    icon: "Wallet",
  },
  {
    label: "Savings",
    path: "/savings",
    icon: "PiggyBank",
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "BarChart3",
  },
  {
    label: "Profile",
    path: "/profile",
    icon: "User",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "Settings",
  },
];