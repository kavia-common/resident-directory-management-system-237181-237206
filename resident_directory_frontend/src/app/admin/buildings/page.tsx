"use client";

/**
 * Admin Buildings page – full CRUD for building/complex records.
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { buildingsApi, BuildingOut } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import AlertMessage from "@/components/ui/AlertMessage";

interface BuildingFormData {
  name: string;
  address: string;
  description: string;
}

const defaultForm: BuildingFormData = { name: "", address: "", description: "" };

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<BuildingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingOut | null>(null);
  const [form, setForm] = useState<BuildingFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await buildingsApi.list();
      setBuildings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buildings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const openCreate = () => {
    setEditingBuilding(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (b: BuildingOut) => {
    setEditingBuilding(b);
    setForm({
      name: b.name,
      address: b.address || "",
      description: b.description || "",
    });
    setModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Building name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address || null,
        description: form.description || null,
      };
      if (editingBuilding) {
        await buildingsApi.update(editingBuilding.id, payload);
        setSuccess("Building updated successfully!");
      } else {
        await buildingsApi.create(payload);
        setSuccess("Building created successfully!");
      }
      setModalOpen(false);
      fetchBuildings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await buildingsApi.delete(id);
      setBuildings((prev) => prev.filter((b) => b.id !== id));
      setDeleteId(null);
      setSuccess("Building deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Manage Buildings"
        subtitle="Admin: CRUD for buildings and complexes"
        action={
          <Button onClick={openCreate} variant="primary" size="sm">
            + Add Building
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.length === 0 ? (
            <div className="col-span-3 border-4 border-retro-dark bg-retro-cream p-8 text-center shadow-[4px_4px_0_#000]">
              <p className="font-mono text-sm text-retro-muted uppercase tracking-widest">
                No buildings yet
              </p>
            </div>
          ) : (
            buildings.map((b) => (
              <div
                key={b.id}
                className="border-4 border-retro-dark bg-retro-cream p-5 shadow-[4px_4px_0_#000]"
              >
                <div className="font-mono font-bold text-retro-dark text-base mb-1">
                  🏢 {b.name}
                </div>
                {b.address && (
                  <div className="font-mono text-xs text-retro-muted mb-1">
                    📍 {b.address}
                  </div>
                )}
                {b.description && (
                  <p className="font-mono text-xs text-retro-dark mt-2 line-clamp-3">
                    {b.description}
                  </p>
                )}
                <div className="font-mono text-xs text-retro-muted mt-3">
                  Added: {new Date(b.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t-2 border-retro-dark">
                  <button
                    onClick={() => openEdit(b)}
                    className="font-mono text-xs font-bold text-retro-green hover:underline"
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="font-mono text-xs font-bold text-retro-red hover:underline"
                  >
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBuilding ? "Edit Building" : "Add Building"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <AlertMessage type="error" message={error} onClose={() => setError("")} />
          )}
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Building name..."
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
            />
          </div>
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Address
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main St..."
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
            />
          </div>
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description..."
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingBuilding ? "✓ Update" : "+ Create"}
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
          Are you sure you want to delete this building? Residents assigned to it will be unlinked.
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
