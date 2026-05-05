import api from "api/axios";


export interface RoleData {
  id: number;
  role_name: string;
  is_active: boolean;
}

export interface AssignRolesPayload {
  emp_id: number;
  role_ids: number[];
}

export async function fetchAvailableRoles() {
  const res = await api.get("/admin/roles/available");
  return (res.data.roles || []) as RoleData[];
}

export async function fetchEmployeeRoles(empId: number) {
  const res = await api.get(`/admin/roles/employee/${empId}`);
  return res.data;
}

export async function assignRoleToEmployee(payload: AssignRolesPayload) {
  const res = await api.post("/admin/roles/assign", payload);
  return res.data;
}

export async function fetchAllRolesAdmin() {
  const res = await api.get("/admin/roles");
  return (res.data.roles || []) as RoleData[];
}

export async function createRole(roleName: string) {
  const res = await api.post("/admin/roles", { role_name: roleName.trim() });
  return res.data;
}

export async function updateRole(
  roleId: number,
  payload: { role_name?: string; is_active?: boolean }
) {
  const res = await api.patch(`/admin/roles/update/${roleId}`, payload);
  return res.data;
}

export async function removeRoleFromEmployee(roleId: number) {
  const res = await api.delete(`/admin/roles/remove/${roleId}`);
  return res.data;
}

export async function fetchEmployeesByRole(roleName: string) {
  const res = await api.get(`/admin/roles/by_role/${encodeURIComponent(roleName)}`);
  return res.data;
}
