import { useCallback, useEffect, useState } from "react";
import {
  RoleData,
  createRole,
  fetchAllRolesAdmin,
  removeRoleFromEmployee,
  updateRole,
} from "features/roles/api/RolesApi";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";

export default function RolesManagement() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    setError("");
    const data = await fetchAllRolesAdmin();
    setRoles(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
      } catch (e: any) {
        const detail = e.response?.data?.detail;
        if (!cancelled) {
          setError(typeof detail === "string" ? detail : "Failed to load roles");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setError("Enter a role name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createRole(name);
      setNewName("");
      await load();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not create role");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (role: RoleData) => {
    setEditingId(role.id);
    setEditName(role.role_name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (roleId: number) => {
    const name = editName.trim();
    if (!name) {
      setError("Role name cannot be empty");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateRole(roleId, { role_name: name });
      cancelEdit();
      await load();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not update role");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (role: RoleData) => {
    if (!window.confirm(`Deactivate role "${role.role_name}"? It will be removed from all employees.`)) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await removeRoleFromEmployee(role.id);
      cancelEdit();
      await load();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not delete role");
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async (role: RoleData) => {
    setSaving(true);
    setError("");
    try {
      await updateRole(role.id, { is_active: true });
      await load();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not reactivate role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white font-inter">Roles</h1>
        <p className="text-sm text-slate-400 font-inter mt-1">
          Create, rename, or deactivate roles used across the organization.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 mb-8">
        <h2 className="text-sm font-medium text-slate-300 font-inter mb-3">Add role</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. HR, Team Lead"
            disabled={saving}
            className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white font-inter placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-inter">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm font-inter">
            <thead className="bg-slate-800/80 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium w-28">Status</th>
                <th className="px-4 py-3 font-medium w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No roles yet. Add one above.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="bg-slate-900/30 hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-white">
                      {editingId === role.id ? (
                        <input
                          type="text"
                          aria-label="Role name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={saving}
                          className="w-full max-w-xs px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        role.role_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                          role.is_active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-slate-600/30 text-slate-400"
                        }`}
                      >
                        {role.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === role.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(role.id)}
                              disabled={saving}
                              className="px-2 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={saving}
                              className="px-2 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {role.is_active ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(role)}
                                  disabled={saving}
                                  className="p-2 text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
                                  title="Edit name"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeactivate(role)}
                                  disabled={saving}
                                  className="p-2 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                  title="Deactivate"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReactivate(role)}
                                disabled={saving}
                                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                                title="Reactivate"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reactivate
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
