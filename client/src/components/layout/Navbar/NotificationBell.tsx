import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { Bell, CheckCheck } from "lucide-react";

import { useSelector } from "react-redux";

import type { RootState } from "../../../app/store";
import API from "../../../services/api";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

type ActivityTransaction = {
  id: string | number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  createdAt?: string;
};

const getReadIds = (key: string) => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
};

const NotificationBell = () => {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const currency = useSelector((state: RootState) => state.auth.user?.defaultCurrency ?? "ZAR");
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<ActivityTransaction[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const readKey = `expense-notifications:${userId ?? "guest"}:read`;
  const unreadCount = transactions.filter((transaction) => !readIds.includes(String(transaction.id))).length;

  useEffect(() => {
    setReadIds(getReadIds(readKey));
    setTransactions([]);
  }, [readKey]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const loadNotifications = async () => {
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get<ActivityTransaction[]>("/transactions");
      setTransactions(data.slice(0, 8));
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = () => {
    const nextReadIds = Array.from(new Set([
      ...readIds,
      ...transactions.map((transaction) => String(transaction.id)),
    ]));
    setReadIds(nextReadIds);
    localStorage.setItem(readKey, JSON.stringify(nextReadIds));
  };

  const markRead = (id: string | number) => {
    const transactionId = String(id);
    if (readIds.includes(transactionId)) return;
    const nextReadIds = [...readIds, transactionId];
    setReadIds(nextReadIds);
    localStorage.setItem(readKey, JSON.stringify(nextReadIds));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100"
        type="button"
        title="Notifications"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => open ? setOpen(false) : void loadNotifications()}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <section className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg" aria-label="Notifications">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-slate-950">Notifications</h2>
              <p className="text-xs text-slate-500">Recent transaction activity</p>
            </div>
            {unreadCount > 0 && (
              <button className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800" type="button" onClick={markAllRead}>
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </header>

          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">Loading activity...</p>
          ) : error ? (
            <p className="px-4 py-6 text-center text-sm text-red-600" role="alert">{error}</p>
          ) : transactions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No recent activity yet.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {transactions.map((transaction) => {
                const isUnread = !readIds.includes(String(transaction.id));
                return (
                  <li key={transaction.id}>
                    <button
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      type="button"
                      onClick={() => markRead(transaction.id)}
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isUnread ? "bg-emerald-500" : "bg-transparent"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-slate-900">{transaction.title}</span>
                          <span className={`shrink-0 text-sm font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-700"}`}>
                            {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">{transaction.category} · {formatDate(transaction.date)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
