import api from "api/axios";
import { EmployeeTableData } from "../modal/EmployeesContext";

// Map backend snake_case response to frontend camelCase
function mapEmployeeResponse(emp: any): EmployeeTableData {
  return {
    id: emp.employee_code,
    name: emp.name,
    status: emp.status ? "Active" : "Inactive",
    date: emp.date_of_joining,
    fullTimeJoinDate: emp.fulltime_joining_date,
    lastIncreamentDate: emp.last_increment_date,
    department: emp.department,
    email: emp.email,
    cnic: emp.cnic,
    designation: emp.designation,
    hobbies: emp.hobbies,
    vehicleRegistrationNumber: emp.vehicle_registration_number,
    dateOfBirth: emp.date_of_birth,
    actualDateOfBirth: emp.actual_date_of_birth,
    bankName: emp.bank_name,
    bankTitle: emp.bank_account_title,
    bankAccountNumber: emp.bank_account_number,
    bankIBAN: emp.bank_iban_number,
    bankBranchCode: emp.bank_branch_code,
    initialBaseSalary: String(emp.initial_base_salary),
    currentBaseSalary: String(emp.current_base_salary),
    homeAddress: emp.home_address,
    badgeNumber: emp.badge_number,
    image: emp.profile_pic_url,
  };
}

export async function fetchEmployees(page = 1, pageSize = 10, department?: string, search?: string, status?: string) {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (department) params.department = department;
  if (search) params.search = search;
  if (status) params.status = status;

  const res = await api.get("/admin/display_all_employees", { params });
  return {
    employees: (res.data.employees || []).map(mapEmployeeResponse),
    totalCount: res.data.total_count,
    totalPages: res.data.total_pages,
    page: res.data.page,
    pageSize: res.data.page_size,
  };
}

export async function deactivateEmployee(employeeCode: string) {
  const res = await api.patch(`/admin/deactivate_employee?employee_code=${encodeURIComponent(employeeCode)}`);
  return res.data;
}

// --- Create/Update helpers ---

function buildEmployeePayload(employeeData: Record<string, any>) {
  return {
    employee_code: employeeData.employeeCode,
    name: employeeData.name,
    email: employeeData.email,
    password: employeeData.password,
    bank_name: employeeData.bankName,
    bank_account_title: employeeData.bankTitle,
    bank_branch_code: employeeData.bankBranchCode,
    bank_account_number: employeeData.bankAccountNumber,
    bank_iban_number: employeeData.bankIBAN,
    initial_base_salary: parseFloat(employeeData.initialBaseSalary) || 0,
    current_base_salary: parseFloat(employeeData.currentBaseSalary) || 0,
    date_of_joining: employeeData.date || null,
    fulltime_joining_date: employeeData.fullTimeJoinDate || null,
    last_increment_date: employeeData.lastIncreamentDate || null,
    increment_amount: parseFloat(employeeData.increamentAmount) || 0,
    department: employeeData.department,
    home_address: employeeData.homeAddress,
    designation: employeeData.designation,
    cnic: employeeData.cnic,
    date_of_birth: employeeData.dateOfBirth || null,
    actual_date_of_birth: employeeData.actualDateOfBirth || null,
    hobbies: employeeData.hobbies || null,
    vehicle_registration_number: employeeData.vehicleRegistrationNumber || null,
    badge_number: employeeData.badgeNumber || null,
    profile_pic_url: employeeData.profilePicUrl || null,
  };
}

export async function createEmployee(employeeData: Record<string, any>) {
  const payload = buildEmployeePayload(employeeData);
  const res = await api.post("/admin/create_employee", payload);
  return res.data;
}

export async function updateEmployee(employeeCode: string, employeeData: Record<string, any>) {
  const payload = buildEmployeePayload(employeeData);
  // Don't send email/password on edit — managed separately
  delete payload.email;
  delete payload.password;
  const res = await api.patch(`/admin/update_employee_details?employee_code=${encodeURIComponent(employeeCode)}`, payload);
  return res.data;
}

// --- Increment API ---

export async function fetchIncrements(employeeCode: string) {
  const res = await api.get(`/admin/get_increments/${encodeURIComponent(employeeCode)}`);
  return res.data;
}

export async function createIncrement(data: { employee_code: string; increment_amount: number; effective_date: string; notes?: string }) {
  const res = await api.post("/admin/create_increment", data);
  return res.data;
}

export async function updateIncrement(incrementId: number, data: { increment_amount?: number; effective_date?: string; notes?: string }) {
  const res = await api.patch(`/admin/update_increment/${incrementId}`, data);
  return res.data;
}

export async function deleteIncrement(incrementId: number) {
  const res = await api.delete(`/admin/delete_increment/${incrementId}`);
  return res.data;
}

export async function uploadProfilePic(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/admin/upload_profile_pic", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url as string;
}
