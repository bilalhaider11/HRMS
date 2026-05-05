import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { deactivateEmployee } from '../api/employeesApi';

export interface IncrementHistory {
  increamentId?: string;
  increamentAmount: number;
  increamentDate: string;
  notes?: string;
}

export interface EmployeeTableData {
  empId?: number;
  id?: string;
  name: string;
  status: string;
  date?: string;
  fullTimeJoinDate?: string;
  lastIncreamentDate?: string;
  department?: string;
  employeeInformation?: string;
  email?: string;
  password?: string;
  cnic?: string;
  designation?: string;
  hobbies?: string;
  vehicleRegistrationNumber?: string;
  badgeNumber?: string;
  dateOfBirth?: string;
  actualDateOfBirth?: string;
  bankName?: string;
  bankTitle?: string;
  bankAccountNumber?: string;
  bankIBAN?: string;
  bankBranchCode?: string;
  initialBaseSalary?: string;
  currentBaseSalary?: string;
  lastIncreament?: IncrementHistory[];
  lastIncreamentId?: string;
  homeAddress?: string;
  additionalRoles?: string;
  image?: string;
}

export interface StatusListData {
  active: "string",
  inActive: "string",
  terminated: "string",
  resigned: "string", retired: "string", onLeave: "string", suspended: "string", probationary: "string",
}

// Role data interface
export interface RoleData {
  id: number;
  role_name: string;
  is_active: boolean;
}

export interface EmployeesContextType {
  employeesList: EmployeeTableData[];
  setEmployeesList: (list: EmployeeTableData[]) => void;
  addEmployee: (employee: EmployeeTableData) => boolean;
  clearError: () => void;
  idExistError: string;
  successfullModal: boolean;
  setSuccessfullModal: (value: boolean) => void;
  editEmployeeData: (emp: EmployeeTableData) => void;
  editIncreamentList: (inc: IncrementHistory) => void;
  setEditingEmployee: (emp: EmployeeTableData | null) => void;
  updateEmployee: (emp: EmployeeTableData) => void;
  editingEmployee: EmployeeTableData | null;
  statusList?: StatusListData[];
  updateStatus: (id: string, newStatus: string) => void;
  editingIncreamentList: IncrementHistory | null;
  setEditingIncreamentList: (inc: IncrementHistory | null) => void;
  employeeIncreamentList: IncrementHistory[];
  setEmployeeIncreamentList: (inc: IncrementHistory[]) => void;
  isDeleteModal: IncrementHistory | null
  setIsDeleteModal: (inc: IncrementHistory | null) => void
  isEmployeeDelete: EmployeeTableData | null;
  setIsEmployeeDelete: (emp: EmployeeTableData | null) => void;
  addNewIncrement: (increament: IncrementHistory) => boolean;
  updateIncrement: (increament: IncrementHistory) => void;
  handleIncrementDelete:(increament: IncrementHistory) => void;
  handleEmployeeDelete:(employee: EmployeeTableData) => void
  selectedEmployeeForRole: EmployeeTableData | null;
  setSelectedEmployeeForRole: (emp: EmployeeTableData | null) => void;
  employeeRoles: RoleData[];
  setRolesForEmployee: (roles: RoleData[]) => void;
  availableRoles: RoleData[];
  setRolesAvailable: (roles: RoleData[]) => void;
  isRoleModalOpen: boolean;
  setIsRoleModalOpen: (open: boolean) => void;
  openRoleModal: (employee: EmployeeTableData) => void;
  closeRoleModal: () => void;
}


const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined);

export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error('Error');
  }
  return context;
};

interface EmployeesProviderProps {
  children: ReactNode;
}

export const EmployeesProvider: React.FC<EmployeesProviderProps> = ({ children }) => {
  const [employeesList, setEmployeesList] = useState<EmployeeTableData[]>([]);
  const [statusList] = useState<StatusListData[]>([])
  const [idExistError, setIdExistError] = useState("")
  const [successfullModal, setSuccessfullModal] = useState<boolean>(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeTableData | null>(null);
  const [editingIncreamentList, setEditingIncreamentList] = useState<IncrementHistory | null>(null);
  const [employeeIncreamentList, setEmployeeIncreamentList] = useState<IncrementHistory[]>([])
  const [isEmployeeDelete, setIsEmployeeDelete] = useState<EmployeeTableData | null>(null)
  const [isDeleteModal, setIsDeleteModal] = useState<IncrementHistory | null>(null);
  
  // Role management state
  const [selectedEmployeeForRole, setSelectedEmployeeForRole] = useState<EmployeeTableData | null>(null);
  const [employeeRoles, setEmployeeRoles] = useState<RoleData[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleData[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);


  const isDuplicateId = (id?: string) => {
    return id ? employeesList.some((employee) => employee.id === id) : false;
  }

  const addEmployee = (employee: EmployeeTableData) => {
    if (isDuplicateId(employee.id)) {
      setIdExistError("ID already exist");
      return false
    } else {
      const updatedList = [...employeesList, employee];
      console.log("added")
      setEmployeesList(updatedList);
      setEditingEmployee(null)
      setIdExistError("")
      setSuccessfullModal(true)
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden"
      return true
    }
  };


  const addNewIncrement = (increament: IncrementHistory) => {
    const updatedIncreamentList = [...employeeIncreamentList, increament];
    setEmployeeIncreamentList(updatedIncreamentList)
    setEditingIncreamentList(null)
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden"
    return true
  };

  const editIncreamentList = (increament: IncrementHistory) => {
    setEditingIncreamentList(increament)
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
  }

  const updateIncrement = (increament: IncrementHistory) => {
    const updatedList = employeeIncreamentList.map((inc) =>
      inc.increamentDate === editingIncreamentList?.increamentDate ? increament : inc
    );
    setEmployeeIncreamentList(updatedList);
    setEditingIncreamentList(null);
    setSuccessfullModal(true);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
  }

  const editEmployeeData = (employee: EmployeeTableData) => {
    console.log(employee)
    setEditingEmployee(employee);
    setSuccessfullModal(false);
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
  };

  const updateEmployee = (updatedEmployee: EmployeeTableData) => {
    if (
      isDuplicateId(updatedEmployee.id) &&
      updatedEmployee.id !== editingEmployee?.id
    ) {
      setIdExistError("Employee ID already exists. Please use a unique ID.");
      return;
    }
    const updatedList = employeesList.map((emp) =>
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    console.log("updateList", updatedList)
    setEmployeesList(updatedList);
    setSuccessfullModal(true);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    setIdExistError("");
  };

  const handleIncrementDelete = (increament: IncrementHistory) => {
    const updatingList = employeeIncreamentList.filter(i => i.increamentId !== increament.increamentId)
    setEmployeeIncreamentList(updatingList)
    setIsDeleteModal(null)
  }

  const handleEmployeeDelete = async (employee: EmployeeTableData) => {
    try {
      await deactivateEmployee(employee.id || "");
      // Remove from local list after successful backend call
      const updateEmployeeList = employeesList.filter(e => e.id !== employee.id);
      setEmployeesList(updateEmployeeList);
    } catch (error) {
      console.error("Failed to deactivate employee:", error);
    }
    setIsEmployeeDelete(null);
    document.body.style.overflow = "auto";
  }


  const updateStatus = (id: string, newStatus: string) => {
    const updatedList = employeesList.map((emp) =>
      emp.id === id ? { ...emp, status: newStatus } : emp
    );
    setEmployeesList(updatedList);
  };

  const clearError = () => setIdExistError("");

  // Employee-role management functions
  const openRoleModal = (employee: EmployeeTableData) => {
    setSelectedEmployeeForRole(employee);
    setIsRoleModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeRoleModal = () => {
    setSelectedEmployeeForRole(null);
    setEmployeeRoles([]);
    setIsRoleModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const setRolesForEmployee = (roles: RoleData[]) => {
    setEmployeeRoles(roles);
  };

  const setRolesAvailable = (roles: RoleData[]) => {
    setAvailableRoles(roles);
  };

  return (
    <EmployeesContext.Provider value={{ 
      employeesList, setEmployeesList, addEmployee, idExistError, clearError, successfullModal, setSuccessfullModal, 
      editEmployeeData, editingEmployee, updateEmployee, setEditingEmployee, statusList, updateStatus, 
      addNewIncrement, editIncreamentList, editingIncreamentList, setEditingIncreamentList, employeeIncreamentList, 
      setEmployeeIncreamentList, updateIncrement, handleIncrementDelete, setIsDeleteModal, isDeleteModal, 
      setIsEmployeeDelete, isEmployeeDelete, handleEmployeeDelete,
      // Role management
      selectedEmployeeForRole, setSelectedEmployeeForRole,
      employeeRoles, setRolesForEmployee,
      availableRoles, setRolesAvailable,
      isRoleModalOpen, setIsRoleModalOpen,
      openRoleModal, closeRoleModal
    }}>
      {children}
    </EmployeesContext.Provider>
  );
};
