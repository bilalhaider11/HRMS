import { useEffect, useState } from "react";
import {
  fetchAvailableRoles,
  fetchEmployeesByRole,
  RoleData,
} from "features/roles/api/RolesApi";

interface EmployeeByRole {
  employee_id: number;
  employee_code: string;
  employee_name: string;
}

export default function RoleEmployeesView() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [employees, setEmployees] = useState<EmployeeByRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingRoles(true);
      setError("");
      try {
        const data = await fetchAvailableRoles();
        if (cancelled) return;
        setRoles(data);
        if (data.length > 0) {
          setSelectedRole(data[0].role_name);
        }
      } catch (e: any) {
        if (cancelled) return;
        const detail = e.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Failed to load roles");
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setLoadingEmployees(true);
    setError("");
    try {
      const data = await fetchEmployeesByRole(selectedRole);
      setEmployees((data.employees || []) as EmployeeByRole[]);
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to fetch employees for selected role"
      );
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white font-inter">
          Employees by Role
        </h1>
        <p className="text-sm text-slate-400 font-inter mt-1">
          Select a role to view all assigned employees.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label htmlFor="role-select" className="block text-sm text-slate-300 font-inter mb-2">
              Role
            </label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loadingRoles || loadingEmployees}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white font-inter focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.role_name}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={!selectedRole || loadingRoles || loadingEmployees}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors"
          >
            {loadingEmployees ? "Loading..." : "Show Employees"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-inter">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm font-inter">
          <thead className="bg-slate-800/80 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Employee Code</th>
              <th className="px-4 py-3 font-medium">Employee Name</th>
              <th className="px-4 py-3 font-medium">Employee ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  {selectedRole
                    ? "No employees found for selected role."
                    : "Select a role and click Show Employees."}
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.employee_id} className="bg-slate-900/30">
                  <td className="px-4 py-3 text-slate-300">{employee.employee_code}</td>
                  <td className="px-4 py-3 text-white">{employee.employee_name}</td>
                  <td className="px-4 py-3 text-slate-300">{employee.employee_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
