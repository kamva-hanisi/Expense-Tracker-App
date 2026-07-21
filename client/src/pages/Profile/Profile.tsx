import { Mail, MapPin, Phone, User } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

const Profile = () => {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage personal details used across your financial workspace."
        actions={<Button>Save changes</Button>}
      />

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white">
              <User size={42} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-950">Kamva Hanisi</h2>
            <p className="text-sm text-slate-500">Personal finance account</p>
          </div>

          <div className="mt-8 space-y-4 text-sm">
            {[
              { icon: Mail, label: "kamva@example.com" },
              { icon: Phone, label: "+27 72 000 0000" },
              { icon: MapPin, label: "Johannesburg, South Africa" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex items-center gap-3 text-slate-600">
                  <Icon size={18} className="text-emerald-700" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Account details</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            {[
              ["First name", "Kamva"],
              ["Last name", "Hanisi"],
              ["Email", "kamva@example.com"],
              ["Phone", "+27 72 000 0000"],
              ["City", "Johannesburg"],
              ["Default currency", "ZAR"],
            ].map(([label, value]) => (
              <label key={label} className="block">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500"
                  defaultValue={value}
                />
              </label>
            ))}
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Monthly note</span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500"
                defaultValue="Focus on lowering dining spend and topping up the emergency fund."
              />
            </label>
          </form>
        </Card>
      </section>
    </div>
  );
};

export default Profile;
