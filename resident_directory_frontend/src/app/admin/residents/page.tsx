"use client";

/**
 * Admin Residents page – full CRUD for resident profiles.
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { residentsApi, buildingsApi, adminApi, ResidentOut, BuildingOut, AdminUserOut } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import AlertMessage from "@/components/ui/AlertMessage";

interface ResidentFormData {
  first_name: string;
  last_name: string;
  unit_number: string;
  phone: string;
  email: string;
  photo_url: string;
  building_id: string;
  move_in_date: string;
  is_active: boolean;
  user_id: string;
}

const defaultForm: ResidentFormData = {
  first_name: "",
  last_name: "",
  unit_number: "",
  phone: "",
  email: "",
  photo_url: "",
  building_id: "",
  move_in_date: "",
  is_active: true,
  user_id: "",
};

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<ResidentOut[]>([]);
  const [buildings, setBuildings] = useState<BuildingOut[]>([]);
  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentOut | null>(null);
  const [form, setForm] = useState<ResidentFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const buildingMap = Object.fromEntries(buildings.map((b) => [b.id, b.name]));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, blds, usrs] = await Promise.all([
        residentsApi.list({ limit: 100 }),
        buildingsApi.list(),
        adminApi.listUsers({ limit: 200 }),
      ]);
      setResidents(res);
      setBuildings(blds);
      setUsers(usrs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingResident(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (r: ResidentOut) => {
    setEditingResident(r);
    setForm({
      first_name: r.first_name,
      last_name: r.last_name,
      unit_number: r.unit_number || "",
      phone: r.phone || "",
      email: r.email || "",
      photo_url: r.photo_url || "",
      building_id: r.building_id ? String(r.building_id) : "",
      move_in_date: r.move_in_date || "",
      is_active: r.is_active,
      user_id: r.user_id ? String(r.user_id) : "",
    });
    setModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        unit_number: form.unit_number || null,
        phone: form.phone || null,
        email: form.email || null,
        photo_url: form.photo_url || null,
        building_id: form.building_id ? Number(form.building_id) : null,
        move_in_date: form.move_in_date || null,
        user_id: form.user_id ? Number(form.user_id) : null,
      };

      if (editingResident) {
        await residentsApi.update(editingResident.id, {
          ...payload,
          is_active: form.is_active,
        });
        setSuccess("Resident updated successfully!");
      } else {
        await residentsApi.create(payload);
        setSuccess("Resident created successfully!");
      }
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await residentsApi.delete(id);
      setResidents((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
      setSuccess("Resident deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Manage Residents"
        subtitle="Admin: CRUD for resident profiles"
        action={
          <Button onClick={openCreate} variant="primary" size="sm">
            + Add Resident
          </Button>
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

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto border-4 border-retro-dark shadow-[4px_4px_0_#000]">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="bg-retro-dark text-retro-green">
                {["ID", "Name", "Unit", "Building", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest border-r-2 border-retro-green last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {residents.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b-2 border-retro-dark ${i % 2 === 0 ? "bg-retro-cream" : "bg-white"} hover:bg-retro-green/10`}
                >
                  <td className="px-4 py-2 text-retro-muted">{r.id}</td>
                  <td className="px-4 py-2 font-bold text-retro-dark">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="px-4 py-2 text-retro-muted">{r.unit_number || "—"}</td>
                  <td className="px-4 py-2 text-retro-muted">
                    {r.building_id ? buildingMap[r.building_id] || r.building_id : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={r.is_active ? "green" : "red"}>
                      {r.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="font-mono text-xs text-retro-green hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="font-mono text-xs text-retro-red hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {residents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-retro-muted">
                    No residents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResident ? "Edit Resident" : "Add Resident"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <AlertMessage type="error" message={error} onClose={() => setError("")} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                First Name *
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
                Last Name *
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
                Move-in Date
              </label>
              <input
                name="move_in_date"
                value={form.move_in_date}
                onChange={handleChange}
                type="date"
                className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                Linked User
              </label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
              >
                <option value="">None</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
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

          {editingResident && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-4 w-4 border-2 border-retro-dark"
              />
              <label htmlFor="is_active" className="font-mono text-sm text-retro-dark">
                Active Resident
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingResident ? "✓ Update" : "+ Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="font-mono text-sm text-retro-dark mb-6">
          Are you sure you want to permanently delete this resident?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteId !== null && handleDelete(deleteId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
