import {
  Banknote,
  BriefcaseBusiness,
  Car,
  Coffee,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Utensils,
} from "lucide-react";
import type { ComponentType } from "react";

export type TransactionKind = "income" | "expense";

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionKind;
  account: string;
  status: "Cleared" | "Pending";
};

export type Budget = {
  name: string;
  spent: number;
  limit: number;
  icon: ComponentType<{ className?: string; size?: number }>;
  color: string;
};

export type SavingGoal = {
  name: string;
  saved: number;
  target: number;
  deadline: string;
  color: string;
};

export const transactions: Transaction[] = [
  { id: "TX-1008", merchant: "Payroll Deposit", category: "Salary", date: "2026-07-20", amount: 42800, type: "income", account: "Main account", status: "Cleared" },
  { id: "TX-1007", merchant: "Checkers Hyper", category: "Groceries", date: "2026-07-19", amount: 1248.9, type: "expense", account: "Debit card", status: "Cleared" },
  { id: "TX-1006", merchant: "Uber", category: "Transport", date: "2026-07-18", amount: 184.5, type: "expense", account: "Credit card", status: "Pending" },
  { id: "TX-1005", merchant: "Woolworths Cafe", category: "Dining", date: "2026-07-17", amount: 236.4, type: "expense", account: "Debit card", status: "Cleared" },
  { id: "TX-1004", merchant: "Freelance Project", category: "Side income", date: "2026-07-15", amount: 6500, type: "income", account: "Main account", status: "Cleared" },
  { id: "TX-1003", merchant: "Vodacom", category: "Utilities", date: "2026-07-14", amount: 899, type: "expense", account: "Debit order", status: "Cleared" },
  { id: "TX-1002", merchant: "Virgin Active", category: "Health", date: "2026-07-12", amount: 799, type: "expense", account: "Debit order", status: "Cleared" },
  { id: "TX-1001", merchant: "Takealot", category: "Shopping", date: "2026-07-10", amount: 1475, type: "expense", account: "Credit card", status: "Cleared" },
];

export const budgets: Budget[] = [
  { name: "Housing", spent: 9200, limit: 11000, icon: Home, color: "bg-emerald-500" },
  { name: "Groceries", spent: 3840, limit: 5200, icon: ShoppingBag, color: "bg-sky-500" },
  { name: "Transport", spent: 2140, limit: 3000, icon: Car, color: "bg-amber-500" },
  { name: "Dining", spent: 1860, limit: 2400, icon: Utensils, color: "bg-rose-500" },
  { name: "Utilities", spent: 1720, limit: 2200, icon: Smartphone, color: "bg-violet-500" },
  { name: "Wellness", spent: 940, limit: 1600, icon: HeartPulse, color: "bg-teal-500" },
];

export const savingGoals: SavingGoal[] = [
  { name: "Emergency fund", saved: 48500, target: 75000, deadline: "Dec 2026", color: "bg-emerald-500" },
  { name: "Cape Town trip", saved: 12800, target: 22000, deadline: "Oct 2026", color: "bg-sky-500" },
  { name: "New laptop", saved: 18400, target: 30000, deadline: "Nov 2026", color: "bg-violet-500" },
];

export const categories = [
  { name: "Salary", amount: 42800, icon: BriefcaseBusiness, tone: "bg-emerald-100 text-emerald-700" },
  { name: "Groceries", amount: 3840, icon: ShoppingBag, tone: "bg-sky-100 text-sky-700" },
  { name: "Transport", amount: 2140, icon: Car, tone: "bg-amber-100 text-amber-700" },
  { name: "Dining", amount: 1860, icon: Coffee, tone: "bg-rose-100 text-rose-700" },
  { name: "Education", amount: 1250, icon: GraduationCap, tone: "bg-indigo-100 text-indigo-700" },
];

export const receipts = [
  { merchant: "Checkers Hyper", total: 1248.9, items: 18, status: "Matched", icon: Receipt },
  { merchant: "Fuel Station", total: 820, items: 2, status: "Review", icon: Car },
  { merchant: "Travel Booking", total: 3140, items: 1, status: "Matched", icon: Plane },
];

export const monthlyTrend = [
  { month: "Feb", income: 41200, expenses: 28600 },
  { month: "Mar", income: 42500, expenses: 30200 },
  { month: "Apr", income: 41800, expenses: 27900 },
  { month: "May", income: 46300, expenses: 31600 },
  { month: "Jun", income: 44100, expenses: 29400 },
  { month: "Jul", income: 49300, expenses: 22502 },
];

export const accountCards = [
  { name: "Main account", value: 84220, detail: "FNB cheque", icon: Banknote },
  { name: "Credit card", value: -4820, detail: "Due in 9 days", icon: ShieldCheck },
  { name: "Investments", value: 126400, detail: "Balanced ETF", icon: BriefcaseBusiness },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export const totalIncome = transactions
  .filter((transaction) => transaction.type === "income")
  .reduce((sum, transaction) => sum + transaction.amount, 0);

export const totalExpenses = transactions
  .filter((transaction) => transaction.type === "expense")
  .reduce((sum, transaction) => sum + transaction.amount, 0);

export const totalSaved = savingGoals.reduce((sum, goal) => sum + goal.saved, 0);
