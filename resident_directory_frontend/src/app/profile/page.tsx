"use client";

/**
 * Profile page – allows authenticated users to view and update their resident profile
 * and privacy settings.
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { residentsApi, buildingsApi, ResidentOut, BuildingOut, PrivacySettingsOut, PrivacySettingsUpdate } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import AlertMessage from "@/components/ui/AlertMessage";
import Badge from "@/components/ui/Badge";

export default function ProfilePage() {
  const [resident, setResident] = useState<ResidentOut | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettingsOut | null>(null);
  const [buildings, setBuildings] = useState<BuildingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    photo_url: "",
    unit_number: "",
    building_id: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, blds] = await Promise.all([
        residentsApi.me(),
        buildingsApi.list(),
      ]);
      setResident(res);
      setBuildings(blds);
      setForm({
        first_name: res.first_name,
        last_name: res.last_name,
        phone: res.phone || "",
        email: res.email || "",
        photo_url: res.photo_url || "",
        unit_number: res.unit_number || "",
        building_id: res.building_id ? String(res.building_id) : "",
      });
      // Fetch privacy settings
      const priv = await residentsApi.getPrivacy(res.id);
      setPrivacy(priv);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await residentsApi.update(resident.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        email: form.email || null,
        photo_url: form.photo_url || null,
        unit_number: form.unit_number || null,
        building_id: form.building_id ? Number(form.building_id) : null,
      });
      setResident(updated);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyToggle = async (field: keyof PrivacySettingsUpdate) => {
    if (!resident || !privacy) return;
    setSavingPrivacy(true);
    setError("");
    try {
      const update: PrivacySettingsUpdate = { [field]: !privacy[field as keyof PrivacySettingsOut] };
      const updated = await residentsApi.updatePrivacy(resident.id, update);
      setPrivacy(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update privacy");
    } finally {
      setSavingPrivacy(false);
    }
  };

  const buildingName =
    resident?.building_id
      ? buildings.find((b) => b.id === resident.building_id)?.name
      : null;

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (!resident) {
    return (
      <AppShell>
        <PageHeader title="My Profile" />
        <AlertMessage
          type="info"
          message="No resident profile linked to your account. Please contact an admin."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="My Profile"
        subtitle="View and edit your resident information"
        action={
          !editMode ? (
            <Button onClick={() => setEditMode(true)} variant="secondary" size="sm">
              ✎ Edit
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4">
          <AlertMessage type="error" message={error} onClose={() => setError("")} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-2 border-4 border-retro-dark bg-retro-cream p-6 shadow-[4px_4px_0_#000]">
          <div className="font-mono text-xs uppercase tracking-widest text-retro-muted mb-4 border-b-2 border-retro-dark pb-2">
            ▶ Profile Information
          </div>

          {!editMode ? (
            /* View mode */
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {resident.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resident.photo_url}
                    alt={`${resident.first_name} ${resident.last_name}`}
                    className="h-20 w-20 border-2 border-retro-dark object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 border-2 border-retro-dark bg-retro-green flex items-center justify-center font-mono font-bold text-retro-dark text-2xl">
                    {resident.first_name[0]}{resident.last_name[0]}
                  </div>
                )}
                <div>
                  <div className="font-mono font-bold text-retro-dark text-xl">
                    {resident.first_name} {resident.last_name}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={resident.is_active ? "green" : "red"}>
                      {resident.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {buildingName && <Badge variant="blue">{buildingName}</Badge>}
                    {resident.unit_number && (
                      <Badge variant="gray">Unit {resident.unit_number}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3">
                {[
                  { label: "Phone", value: resident.phone },
                  { label: "Email", value: resident.email },
                  { label: "Move-in Date", value: resident.move_in_date },
                ].map(({ label, value }) => (
                  <div key={label} className="border-l-4 border-retro-green pl-3">
                    <dt className="font-mono text-xs uppercase text-retro-muted">{label}</dt>
                    <dd className="font-mono text-sm text-retro-dark">
                      {value || <span className="text-retro-muted">—</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            /* Edit mode */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                    First Name
                  </label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                    Last Name
                  </label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                    Unit Number
                  </label>
                  <input
                    name="unit_number"
                    value={form.unit_number}
                    onChange={handleChange}
                    className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                    Building
                  </label>
                  <select
                    name="building_id"
                    value={form.building_id}
                    onChange={handleChange}
                    className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
                  >
                    <option value="">None</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                  Photo URL
                </label>
                <input
                  name="photo_url"
                  value={form.photo_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" loading={saving}>
                  ✓ Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Privacy settings */}
        <div className="border-4 border-retro-dark bg-retro-cream p-6 shadow-[4px_4px_0_#000]">
          <div className="font-mono text-xs uppercase tracking-widest text-retro-muted mb-4 border-b-2 border-retro-dark pb-2">
            ▶ Privacy Settings
          </div>
          {privacy ? (
            <div className="space-y-3">
              <p className="font-mono text-xs text-retro-muted">
                Control what information is visible in the directory.
              </p>
              {(
                [
                  { key: "show_phone", label: "Show Phone" },
                  { key: "show_email", label: "Show Email" },
                  { key: "show_unit", label: "Show Unit" },
                  { key: "show_photo", label: "Show Photo" },
                ] as const
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between border-2 border-retro-dark px-3 py-2"
                >
                  <span className="font-mono text-sm text-retro-dark">{label}</span>
                  <button
                    onClick={() => handlePrivacyToggle(key)}
                    disabled={savingPrivacy}
                    className={`font-mono text-xs font-bold uppercase border-2 px-3 py-1 transition-colors ${
                      privacy[key]
                        ? "bg-retro-green text-retro-dark border-retro-dark"
                        : "bg-retro-muted text-white border-retro-dark"
                    } disabled:opacity-60`}
                    aria-pressed={privacy[key]}
                  >
                    {privacy[key] ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-retro-muted">
              No privacy settings available.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
