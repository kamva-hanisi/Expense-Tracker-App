import { Bell, CreditCard, Shield, SlidersHorizontal } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

const settingsGroups = [
  { title: "Notifications", description: "Budget warnings, receipt scan updates, and weekly summaries.", icon: Bell },
  { title: "Security", description: "Two-factor prompts and trusted device controls.", icon: Shield },
  { title: "Accounts", description: "Connected bank accounts, cards, and manual cash wallets.", icon: CreditCard },
  { title: "Preferences", description: "Currency, date formats, and dashboard defaults.", icon: SlidersHorizontal },
];

const Settings = () => {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Tune the expense tracker to match how you prefer to review and manage money."
        actions={<Button>Save settings</Button>}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {settingsGroups.map((group) => {
          const Icon = group.icon;

          return (
            <Card key={group.title}>
              <div className="flex items-start gap-4">
                <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700"><Icon size={22} /></span>
                <div>
                  <h2 className="font-bold text-slate-950">{group.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{group.description}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {["Enabled", "Email digest", "Mobile alerts"].map((label, index) => (
                  <label key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <span>{label}</span>
                    <input type="checkbox" defaultChecked={index !== 2} className="h-4 w-4 accent-emerald-600" />
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
};

export default Settings;
