import { useRef, useEffect, useMemo, useState } from "react";
import Modal from "../../../shared/Modal";
import { EmployeeTableData, useEmployees } from "features/employees/modal/EmployeesContext";
import {
  fetchAvailableRoles,
  fetchEmployeeRoles,
  assignRoleToEmployee,
  RoleData,
} from "../api/RolesApi";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface RoleModalProps {
  employee: EmployeeTableData;
  onClose: () => void;
  onRolesUpdated: () => void;
}

export const RoleModal = ({ employee, onClose, onRolesUpdated }: RoleModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { availableRoles, setRolesAvailable, setRolesForEmployee } = useEmployees();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [draftRoleIds, setDraftRoleIds] = useState<number[]>([]);

  // For adding/editing role
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editingRoleOptionId, setEditingRoleOptionId] = useState<number | "">("");

  // Get employee ID (convert from employee_code string to number)
  const empId = useMemo(() => {
    const candidates = [
      (employee as any).emp_id,
      (employee as any).empId,
      (employee as any).dbId,
      employee.id,
    ];
    for (const candidate of candidates) {
      const num = Number(candidate);
      if (Number.isInteger(num) && num > 0) return num;
    }
    return 0;
  }, [employee]);

  // Track if roles have been loaded
  const rolesLoadedRef = useRef(false);

  // Load available roles and employee roles - only once
  useEffect(() => {
    if (rolesLoadedRef.current) return;
    rolesLoadedRef.current = true;

    const loadRoles = async () => {
      setLoading(true);
      try {
        // Fetch available roles
        const available = await fetchAvailableRoles();
        console.log("available roles: ",available);
        setRolesAvailable(available);

        // Fetch employee's current roles
        if (empId) {
          console.log("fetching roles for employee id: ", empId);
          const rolesData = await fetchEmployeeRoles(empId);
          console.log("employee roles data: ", rolesData);
          const activeRoles = (rolesData.roles || []).filter((role: RoleData) => role.is_active);
          const activeRoleIds = activeRoles.map((role: RoleData) => role.id);
          setDraftRoleIds(activeRoleIds);
          setRolesForEmployee(activeRoles);
        } else {
          setApiError("Unable to resolve employee ID for role assignment");
        }
      } catch (error) {
        console.error("Failed to load roles:", error);
        setApiError("Failed to load roles");
      }
      setLoading(false);
    };
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle click outside to close modal - stable reference
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    // Add event listener with a small delay to avoid immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleAddRole = () => {
    if (!selectedRoleId) {
      setApiError("Please select a role");
      return;
    }

    if (draftRoleIds.includes(selectedRoleId)) {
      setApiError("Selected role is already added");
      return;
    }

    setApiError("");
    setSuccessMessage("");
    setDraftRoleIds((prev) => [...prev, selectedRoleId]);
    setSelectedRoleId("");
  };

  const handleUpdateRole = (roleId: number) => {
    if (!editingRoleOptionId) {
      setApiError("Please select a role to update");
      return;
    }

    if (draftRoleIds.some((id) => id !== roleId && id === editingRoleOptionId)) {
      setApiError("Role already selected");
      return;
    }

    setApiError("");
    setSuccessMessage("");
    setDraftRoleIds((prev) =>
      prev.map((id) => (id === roleId ? editingRoleOptionId : id))
    );
    setEditingRoleId(null);
    setEditingRoleOptionId("");
  };

  const handleRemoveRole = (targetRoleId: number) => {
    setApiError("");
    setSuccessMessage("");
    setDraftRoleIds((prev) => prev.filter((id) => id !== targetRoleId));
  };

  const startEditRole = (roleId: number) => {
    setEditingRoleId(roleId);
    setEditingRoleOptionId(roleId);
    setSelectedRoleId("");
  };

  const cancelEdit = () => {
    setEditingRoleId(null);
    setEditingRoleOptionId("");
    setSelectedRoleId("");
  };

  const handleSaveRoles = async () => {
    if (!empId) {
      setApiError("Unable to resolve employee ID for role assignment");
      return;
    }

    setSaving(true);
    setApiError("");
    setSuccessMessage("");

    try {
      await assignRoleToEmployee({
        emp_id: empId,
        role_ids: draftRoleIds,
      });

      const rolesData = await fetchEmployeeRoles(empId);
      const activeRoles = (rolesData.roles || []).filter((role: RoleData) => role.is_active);
      setDraftRoleIds(activeRoles.map((role: RoleData) => role.id));
      setRolesForEmployee(activeRoles);
      onRolesUpdated();
      setSuccessMessage("Roles saved successfully");
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      setApiError(typeof detail === "string" ? detail : "Failed to save roles");
    } finally {
      setSaving(false);
    }

  };
  //make it an export statement to make it module


  return (
    <Modal ref={modalRef} closeButtonCLick={onClose}>
      <h1 className="text-lg font-semibold text-center text-white font-inter border-b border-slate-700 p-5">
        Manage Roles
      </h1>

      <div className="px-5 py-4">
        <p className="text-sm text-slate-400 font-inter mb-1">
          Employee: <span className="text-white font-medium">{employee.name}</span>
        </p>
        <p className="text-xs text-slate-500 font-inter">
          Code: <span className="text-slate-400">{employee.id}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Current Roles */}
          <div className="px-5 py-4 border-t border-slate-700">
            <h2 className="text-sm font-medium text-slate-300 font-inter mb-3">
              Current Roles ({draftRoleIds.length})
            </h2>

            {draftRoleIds.length === 0 ? (
              <p className="text-sm text-slate-500 font-inter py-2">
                No roles assigned yet
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {draftRoleIds.map((roleId) => {
                  const role = availableRoles.find((option) => option.id === roleId);
                  if (!role) return null;
                  return (
                  <div
                    key={role.id}
                    className="flex items-center justify-between px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700"
                  >
                    {editingRoleId === role.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          title="Select role to update"
                          value={editingRoleOptionId}
                          onChange={(e) =>
                            setEditingRoleOptionId(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white font-inter focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select role</option>
                          {availableRoles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.role_name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleUpdateRole(role.id)}
                          disabled={saving}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-inter rounded-lg transition-colors"
                        >
                          {saving ? "..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-2 text-slate-400 hover:text-white text-sm font-inter transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm text-white font-inter">{role.role_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditRole(role.id)}
                            className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Edit role"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(role.id)}
                            disabled={saving}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Remove role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Add New Role */}
          <div className="px-5 py-4 border-t border-slate-700">
            <h2 className="text-sm font-medium text-slate-300 font-inter mb-3">
              Add New Role
            </h2>
            <div className="flex items-center gap-2">
              <select
                title="Select a role to add"
                value={selectedRoleId}
                onChange={(e) =>
                  setSelectedRoleId(e.target.value ? Number(e.target.value) : "")
                }
                disabled={saving}
                className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white font-inter focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select a role</option>
                {availableRoles
                  .filter((r) => !draftRoleIds.includes(r.id))
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddRole}
                disabled={saving || !selectedRoleId}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {apiError && (
            <div className="mx-5 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm font-inter">{apiError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mx-5 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 text-sm font-inter">{successMessage}</p>
            </div>
          )}
        </>
      )}

      <div className="border-t border-slate-700 py-4 px-5 flex justify-end">
        <button
          type="button"
          onClick={handleSaveRoles}
          disabled={saving }
          className="px-4 py-2 mr-3 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-inter transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white font-inter transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default RoleModal;