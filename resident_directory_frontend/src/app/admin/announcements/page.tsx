"use client";

/**
 * Admin Announcements page – full CRUD for community announcements.
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { announcementsApi, buildingsApi, AnnouncementOut, BuildingOut } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import AlertMessage from "@/components/ui/AlertMessage";

interface AnnouncementFormData {
  title: string;
  body: string;
  building_id: string;
  is_pinned: boolean;
}

const defaultForm: AnnouncementFormData = {
  title: "",
  body: "",
  building_id: "",
  is_pinned: false,
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementOut[]>([]);
  const [buildings, setBuildings] = useState<BuildingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<AnnouncementOut | null>(null);
  const [form, setForm] = useState<AnnouncementFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const buildingMap = Object.fromEntries(buildings.map((b) => [b.id, b.name]));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ann, blds] = await Promise.all([
        announcementsApi.list({ limit: 100 }),
        buildingsApi.list(),
      ]);
      setAnnouncements(ann);
      setBuildings(blds);
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
    setEditingAnn(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (a: AnnouncementOut) => {
    setEditingAnn(a);
    setForm({
      title: a.title,
      body: a.body,
      building_id: a.building_id ? String(a.building_id) : "",
      is_pinned: a.is_pinned,
    });
    setModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        building_id: form.building_id ? Number(form.building_id) : null,
        is_pinned: form.is_pinned,
      };
      if (editingAnn) {
        await announcementsApi.update(editingAnn.id, payload);
        setSuccess("Announcement updated!");
      } else {
        await announcementsApi.create(payload);
        setSuccess("Announcement created!");
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
      await announcementsApi.delete(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setDeleteId(null);
      setSuccess("Announcement deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Manage Announcements"
        subtitle="Admin: Create and manage community announcements"
        action={
          <Button onClick={openCreate} variant="primary" size="sm">
            + New Announcement
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
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="border-4 border-retro-dark bg-retro-cream p-8 text-center shadow-[4px_4px_0_#000]">
              <p className="font-mono text-sm text-retro-muted uppercase tracking-widest">
                No announcements yet
              </p>
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className={`border-4 bg-retro-cream p-5 shadow-[4px_4px_0_#000] ${
                  a.is_pinned ? "border-retro-yellow" : "border-retro-dark"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {a.is_pinned && <Badge variant="yellow">📌 Pinned</Badge>}
                      {a.building_id && buildingMap[a.building_id] ? (
                        <Badge variant="blue">{buildingMap[a.building_id]}</Badge>
                      ) : (
                        <Badge variant="gray">All Buildings</Badge>
                      )}
                    </div>
                    <h3 className="font-mono font-bold text-retro-dark text-base mb-1">
                      {a.title}
                    </h3>
                    <p className="font-mono text-sm text-retro-dark line-clamp-2">
                      {a.body}
                    </p>
                    <div className="font-mono text-xs text-retro-muted mt-2">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(a)}
                      className="font-mono text-xs font-bold text-retro-green hover:underline"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(a.id)}
                      className="font-mono text-xs font-bold text-retro-red hover:underline"
                    >
                      ✕ Delete
                    </button>
                  </div>
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
        title={editingAnn ? "Edit Announcement" : "New Announcement"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <AlertMessage type="error" message={error} onClose={() => setError("")} />
          )}
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Announcement title..."
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
            />
          </div>
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Body *
            </label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Announcement content..."
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green resize-vertical"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                Building (optional)
              </label>
              <select
                name="building_id"
                value={form.building_id}
                onChange={handleChange}
                className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
              >
                <option value="">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_pinned"
                  checked={form.is_pinned}
                  onChange={handleChange}
                  className="h-4 w-4 border-2 border-retro-dark"
                />
                <span className="font-mono text-sm text-retro-dark">Pin this announcement</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingAnn ? "✓ Update" : "+ Publish"}
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
          Are you sure you want to delete this announcement?
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
