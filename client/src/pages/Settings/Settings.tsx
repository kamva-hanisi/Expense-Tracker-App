import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Bell, CreditCard, Moon, Shield, SlidersHorizontal, Sun, UserRoundX } from "lucide-react";

import type { AppDispatch, RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { currencies } from "../../constants/currencies";
import { syncProfile } from "../../features/auth/authSlice";
import { logout } from "../../features/auth/authSlice";
import { ROUTES } from "../../constants/routes";
import useTheme from "../../context/ThemeContext/useTheme";
import API from "../../services/api";

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  const [transactionActivityEnabled, setTransactionActivityEnabled] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency ?? "ZAR");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [accountAction, setAccountAction] = useState<"deactivate" | "delete" | null>(null);
  const [accountPassword, setAccountPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [accountActionError, setAccountActionError] = useState("");
  const [savingAccountAction, setSavingAccountAction] = useState(false);

  useEffect(() => {
    let active = true;
    API.get<{ transactionActivityEnabled: boolean }>("/settings")
      .then(({ data }) => {
        if (!active) return;
        setTransactionActivityEnabled(data.transactionActivityEnabled);
        dispatch(syncProfile({ transactionActivityEnabled: data.transactionActivityEnabled }));
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const axiosError = requestError as AxiosError<{ message?: string }>;
        setSettingsError(axiosError.response?.data?.message ?? "Unable to load your settings");
      })
      .finally(() => { if (active) setLoadingSettings(false); });
    return () => { active = false; };
  }, [dispatch]);

  useEffect(() => {
    setDefaultCurrency(user?.defaultCurrency ?? "ZAR");
  }, [user?.defaultCurrency]);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.name || !user.email) return;
    setSavingSettings(true);
    setSettingsError("");
    setSettingsMessage("");
    try {
      const [settingsResponse, profileResponse] = await Promise.all([
        API.patch<{ transactionActivityEnabled: boolean }>("/settings", { transactionActivityEnabled }),
        API.patch("/auth/me", {
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          city: user.city ?? "",
          avatarData: user.avatarData ?? null,
          defaultCurrency,
          monthlyNote: user.monthlyNote ?? "",
        }),
      ]);
      dispatch(syncProfile({ ...profileResponse.data, transactionActivityEnabled: settingsResponse.data.transactionActivityEnabled }));
      setSettingsMessage("Settings saved");
    } catch (saveError) {
      const axiosError = saveError as AxiosError<{ message?: string }>;
      setSettingsError(axiosError.response?.data?.message ?? "Unable to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");
    try {
      await API.patch("/auth/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password changed successfully");
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setPasswordError(axiosError.response?.data?.message ?? "Unable to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const performAccountAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accountAction) return;
    if (accountAction === "delete" && deleteConfirmation !== "DELETE") {
      setAccountActionError("Type DELETE to permanently remove this account");
      return;
    }
    setSavingAccountAction(true);
    setAccountActionError("");
    try {
      if (accountAction === "deactivate") {
        await API.post("/auth/deactivate", { currentPassword: accountPassword });
      } else {
        await API.delete("/auth/me", { data: { currentPassword: accountPassword } });
      }
      dispatch(logout());
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setAccountActionError(axiosError.response?.data?.message ?? "Unable to complete this account action");
    } finally {
      setSavingAccountAction(false);
    }
  };

  const closeAccountAction = () => {
    setAccountAction(null);
    setAccountPassword("");
    setDeleteConfirmation("");
    setAccountActionError("");
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your notification, account, and appearance preferences."
        actions={<Button type="submit" form="settings-form" disabled={savingSettings || loadingSettings}>{savingSettings ? "Saving..." : "Save settings"}</Button>}
      />

      <form id="settings-form" onSubmit={saveSettings}>
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="flex items-start gap-4">
              <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700"><Bell size={22} /></span>
              <div>
                <h2 className="font-bold text-slate-950">Notifications</h2>
                <p className="mt-1 text-sm text-slate-500">Choose which in-app activity appears in your notification menu.</p>
              </div>
            </div>
            <label className="mt-6 flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <span>
                In-app transaction activity
                <span className="mt-1 block text-xs font-normal text-slate-500">Show recent income and expense records in the notification menu.</span>
              </span>
              <input type="checkbox" role="switch" aria-label="In-app transaction activity" checked={transactionActivityEnabled} disabled={loadingSettings} className="h-4 w-4 shrink-0 accent-emerald-600" onChange={(event) => { setTransactionActivityEnabled(event.target.checked); setSettingsMessage(""); }} />
            </label>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700"><SlidersHorizontal size={22} /></span>
              <div>
                <h2 className="font-bold text-slate-950">Preferences</h2>
                <p className="mt-1 text-sm text-slate-500">Set the currency used to display account amounts.</p>
              </div>
            </div>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-slate-700">Default currency</span>
              <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" value={defaultCurrency} disabled={loadingSettings} onChange={(event) => { setDefaultCurrency(event.target.value); setSettingsMessage(""); }}>
                {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} · {currency.label}</option>)}
              </select>
            </label>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700">{theme === "dark" ? <Moon size={22} /> : <Sun size={22} />}</span>
              <div>
                <h2 className="font-bold text-slate-950">Appearance</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a light or dark color theme for this browser.</p>
              </div>
            </div>
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-slate-700">Theme</span>
              <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" value={theme} onChange={(event) => { if (event.target.value !== theme) toggleTheme(); }}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-500">Theme changes apply immediately and are saved in this browser.</p>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <span className="rounded-lg bg-slate-100 p-3 text-slate-600"><CreditCard size={22} /></span>
              <div>
                <h2 className="font-bold text-slate-950">Accounts</h2>
                <p className="mt-1 text-sm text-slate-500">Bank connections are not available yet.</p>
              </div>
            </div>
            <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">You can record transactions manually from the dashboard. No bank account is connected.</p>
          </Card>
        </section>

        {settingsError && <p className="mt-4 text-sm text-red-600" role="alert">{settingsError}</p>}
        {settingsMessage && <p className="mt-4 text-sm text-emerald-700" role="status">{settingsMessage}</p>}
      </form>

      <Card className="mt-4">
        <div className="flex items-start gap-4">
          <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700"><Shield size={22} /></span>
          <div>
            <h2 className="font-bold text-slate-950">Security</h2>
            <p className="mt-1 text-sm text-slate-500">Change the password used to sign in to your account.</p>
          </div>
        </div>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={changePassword}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Current password</span>
            <input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">New password</span>
            <input type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" />
          </label>
          {passwordError && <p className="text-sm text-red-600 md:col-span-2" role="alert">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-emerald-700 md:col-span-2" role="status">{passwordMessage}</p>}
          <div className="md:col-span-2"><Button type="submit" disabled={savingPassword}>{savingPassword ? "Changing..." : "Change password"}</Button></div>
        </form>
      </Card>

      <Card className="mt-4 border-red-200">
        <div className="flex items-start gap-4">
          <span className="rounded-lg bg-red-100 p-3 text-red-700"><UserRoundX size={22} /></span>
          <div>
            <h2 className="font-bold text-slate-950">Account actions</h2>
            <p className="mt-1 text-sm text-slate-500">Pause access temporarily or permanently remove your account.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => { setAccountAction("deactivate"); setAccountActionError(""); }}>
            Temporarily deactivate
          </Button>
          <Button type="button" variant="danger" onClick={() => { setAccountAction("delete"); setAccountActionError(""); }}>
            Permanently delete
          </Button>
        </div>
      </Card>

      {accountAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAccountAction(); }}>
          <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true" aria-labelledby="account-action-title">
            <h2 id="account-action-title" className="text-xl font-bold text-slate-950">
              {accountAction === "delete" ? "Permanently delete account?" : "Temporarily deactivate account?"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {accountAction === "delete"
                ? "This permanently deletes your profile, transactions, budgets, savings goals, and settings. This cannot be undone."
                : "Your data will be kept, but access will stop. Sign in again with your password to reactivate the account."}
            </p>
            <form className="mt-5 grid gap-4" onSubmit={performAccountAction}>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Current password</span>
                <input type="password" autoComplete="current-password" required value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" />
              </label>
              {accountAction === "delete" && (
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Type DELETE to confirm</span>
                  <input autoComplete="off" required value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-red-500" />
                </label>
              )}
              {accountActionError && <p className="text-sm text-red-600" role="alert">{accountActionError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={closeAccountAction}>Cancel</Button>
                <Button type="submit" variant={accountAction === "delete" ? "danger" : "primary"} disabled={savingAccountAction}>
                  {savingAccountAction ? "Please wait..." : accountAction === "delete" ? "Delete permanently" : "Deactivate account"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Settings;
