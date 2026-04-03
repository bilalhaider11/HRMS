import EmployeeTable from "./ui/EmployeeTable"
import { useNavigate } from "react-router-dom";
import { useEmployees } from "./modal/EmployeesContext";
import { UserPlus } from "lucide-react";

const EmployeesBody = () => {
    const {setEditingEmployee} = useEmployees()
    const navigate = useNavigate()
    const registerEmployee = () => {
        setEditingEmployee(null)
        navigate("register-employees")
    }
    return (
        <>
            <button
                type="button"
                onClick={registerEmployee}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors"
            >
                <UserPlus className="w-4 h-4" />
                Register Employee
            </button>
            <EmployeeTable />
        </>
    )
}

export default EmployeesBody
