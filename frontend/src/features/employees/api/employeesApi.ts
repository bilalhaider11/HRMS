import api from "api/axios";

export async function createEmployee(employeeData: Record<string, any>, roles: string[]) {
  const payload = {
    employee: {
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
      profile_pic_url: employeeData.profilePicUrl || null,
    },
    lst: roles
      .filter((r) => r.trim() !== "")
      .map((r) => ({ role_name: r, role_description: "" })),
  };

  const res = await api.post("/admin/create_employee", payload);
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
