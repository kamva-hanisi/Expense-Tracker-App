import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { Camera, Mail, MapPin, Phone, User } from "lucide-react";

import type { AppDispatch, RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { currencies } from "../../constants/currencies";
import { syncProfile } from "../../features/auth/authSlice";
import API from "../../services/api";

type ProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  avatarData: string | null;
  defaultCurrency: string;
  monthlyNote: string;
};

const splitName = (name = "") => {
  const [firstName = "", ...lastName] = name.trim().split(/\s+/);
  return { firstName, lastName: lastName.join(" ") };
};

const readProfileImage = async (file: File) => {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process this image");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Could not process this image"));
    }, "image/jpeg", 0.82);
  });

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not read this image"));
    reader.onerror = () => reject(new Error("Could not read this image"));
    reader.readAsDataURL(blob);
  });
};

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const fileInput = useRef<HTMLInputElement>(null);
  const initialName = splitName(currentUser?.name);
  const [profile, setProfile] = useState<ProfileFields>({
    ...initialName,
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
    city: currentUser?.city ?? "",
    avatarData: currentUser?.avatarData ?? null,
    defaultCurrency: currentUser?.defaultCurrency ?? "ZAR",
    monthlyNote: currentUser?.monthlyNote ?? "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const name = [profile.firstName.trim(), profile.lastName.trim()].filter(Boolean).join(" ");

  useEffect(() => {
    let active = true;
    API.get("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        const names = splitName(data.name);
        setProfile({
          ...names,
          email: data.email ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "",
          avatarData: data.avatarData ?? null,
          defaultCurrency: data.defaultCurrency ?? "ZAR",
          monthlyNote: data.monthlyNote ?? "",
        });
        dispatch(syncProfile(data));
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const axiosError = requestError as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message ?? "Unable to load your profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [dispatch]);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    try {
      const avatarData = await readProfileImage(file);
      setProfile((value) => ({ ...value, avatarData }));
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Unable to use this image");
    }
    event.target.value = "";
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { data } = await API.patch("/auth/me", { ...profile, name });
      dispatch(syncProfile(data));
      setMessage("Profile changes saved");
    } catch (saveError) {
      const axiosError = saveError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileFields, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage personal details used across your financial workspace."
        actions={<Button type="submit" form="profile-form" disabled={saving || loading}>{saving ? "Saving..." : "Save changes"}</Button>}
      />

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white">
              {profile.avatarData
                ? <img src={profile.avatarData} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                : <User size={42} />}
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-950">{name || "Your profile"}</h2>
            <p className="text-sm text-slate-500">Personal finance account</p>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}>
                <Camera size={16} />
                Change photo
              </Button>
              {profile.avatarData && (
                <Button type="button" variant="ghost" onClick={() => setProfile((value) => ({ ...value, avatarData: null }))}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm">
            {[
              { icon: Mail, label: profile.email },
              { icon: Phone, label: profile.phone || "Add a phone number" },
              { icon: MapPin, label: profile.city || "Add your city" },
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
          <form id="profile-form" className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">First name</span>
              <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" autoComplete="given-name" required maxLength={100} value={profile.firstName} onChange={(event) => updateField("firstName", event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Last name</span>
              <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" autoComplete="family-name" maxLength={100} value={profile.lastName} onChange={(event) => updateField("lastName", event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input type="email" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" autoComplete="email" required maxLength={255} value={profile.email} onChange={(event) => updateField("email", event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Phone</span>
              <input type="tel" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" autoComplete="tel" maxLength={40} value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">City</span>
              <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" autoComplete="address-level2" maxLength={120} value={profile.city} onChange={(event) => updateField("city", event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Default currency</span>
              <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" value={profile.defaultCurrency} onChange={(event) => updateField("defaultCurrency", event.target.value)}>
                {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} · {currency.label}</option>)}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Monthly note</span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500"
                maxLength={1000}
                value={profile.monthlyNote}
                onChange={(event) => updateField("monthlyNote", event.target.value)}
              />
            </label>
            {error && <p className="text-sm text-red-600 md:col-span-2" role="alert">{error}</p>}
            {message && <p className="text-sm text-emerald-700 md:col-span-2" role="status">{message}</p>}
            {loading && <p className="text-sm text-slate-500 md:col-span-2">Loading profile...</p>}
          </form>
        </Card>
      </section>
    </div>
  );
};

export default Profile;
