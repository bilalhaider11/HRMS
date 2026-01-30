export interface EmployeeTableData {
  id?: string;
  name: string;
  status: string;
  date?: string;
  fullTimeJoinDate?: string;
  lastIncreamentDate?: string,
  department?: string;
  employeeInformation?: string;
  email?: string;
  password?: string;
  cnic?: string;
  designation?: string;
  team?: string;
  hobbies?: string;
  vehicleRegistrationNumber?: string;
  companyId?: string;
  dateOfBirth?: string;
  actualDateOfBirth?: string;
  bankName?: string;
  bankTitle?: string;
  bankAccountNumber?: string;
  bankIBAN?: string;
  bankBranchCode?: string;
  initialBaseSalary?: string;
  currentBaseSalary?: string;
  increamentAmount?: number;
  homeAddress?: string;
  additionalRoles?: string;
  image?: string;
}

export interface EmployeeListData {
  employeesList: EmployeeTableData[]
}
export interface StatusListData {
  active: "string",
  inActive: "string",
  terminated: "string",
  resigned: "string", retired: "string", onLeave: "string", suspended: "string", probationary: "string",

}
export interface StatusListData {
  statusList: StatusListData[]
}

export const fetchEmploeeTableData = async (): Promise<EmployeeListData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/employees_json_data/employeeslist.json"
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchStatusList = async (): Promise<StatusListData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/employees_json_data/statusList.json"
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}