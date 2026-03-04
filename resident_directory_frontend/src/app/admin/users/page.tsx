"use client";

/**
 * Admin Users page – manage user accounts (admin only).
 */
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { adminApi, AdminUserOut } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import AlertMessage from "@/components/ui/AlertMessage";

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
}

const defaultForm: UserFormData = {
  username: "",
  email: "",
  password: "",
  role: "resident",
  is_active: true,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserOut | null>(null);
  const [form, setForm] = useState<UserFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({ limit: 200 });
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (u: AdminUserOut) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      email: u.email,
      password: "",
      role: u.role,
      is_active: u.is_active,
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
      if (editingUser) {
        const update: { email?: string; username?: string; password?: string | null; role?: string; is_active?: boolean } = {
          email: form.email,
          username: form.username,
          role: form.role,
          is_active: form.is_active,
        };
        if (form.password) update.password = form.password;
        await adminApi.updateUser(editingUser.id, update);
        setSuccess("User updated successfully!");
      } else {
        if (!form.password || form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setSaving(false);
          return;
        }
        await adminApi.createUser({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        setSuccess("User created successfully!");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteId(null);
      setSuccess("User deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Manage Users"
        subtitle="Admin: User account management"
        action={
          <Button onClick={openCreate} variant="primary" size="sm">
            + Add User
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
                {["ID", "Username", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
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
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b-2 border-retro-dark ${i % 2 === 0 ? "bg-retro-cream" : "bg-white"} hover:bg-retro-green/10`}
                >
                  <td className="px-4 py-2 text-retro-muted">{u.id}</td>
                  <td className="px-4 py-2 font-bold text-retro-dark">{u.username}</td>
                  <td className="px-4 py-2 text-retro-muted">{u.email}</td>
                  <td className="px-4 py-2">
                    <Badge variant={u.role === "admin" ? "yellow" : "blue"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={u.is_active ? "green" : "red"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-retro-muted text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="font-mono text-xs text-retro-green hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="font-mono text-xs text-retro-red hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-retro-muted">
                    No users found
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
        title={editingUser ? "Edit User" : "Create User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <AlertMessage type="error" message={error} onClose={() => setError("")} />
          )}
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Username *
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
            />
          </div>
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Email *
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
            />
          </div>
          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
              Password {editingUser ? "(leave blank to keep)" : "*"}
            </label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              required={!editingUser}
              minLength={6}
              placeholder={editingUser ? "Leave blank to keep current..." : "Min 6 chars..."}
              className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold uppercase tracking-widest text-retro-dark">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-1 w-full font-mono border-2 border-retro-dark bg-retro-cream px-3 py-2 text-sm focus:outline-none focus:border-retro-green"
              >
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {editingUser && (
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 border-2 border-retro-dark"
                  />
                  <span className="font-mono text-sm text-retro-dark">Active</span>
                </label>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingUser ? "✓ Update" : "+ Create"}
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
          Are you sure you want to permanently delete this user account?
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
