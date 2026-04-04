import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useEmployees } from "./modal/EmployeesContext";
import { ArrowLeft } from "lucide-react";
import Form from "./ui/Form";

const UpdateEmployee = () => {
    const { employeesList, editEmployeeData, editingEmployee, setEditingEmployee } = useEmployees();
    const { employeeCode } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (employeesList.length > 0 && editingEmployee === null && employeeCode) {
            const foundEmployee = employeesList.find((emp) => emp?.id === employeeCode);
            if (foundEmployee) {
                editEmployeeData(foundEmployee);
            }
        }
        return () => {
            setEditingEmployee(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeesList, employeeCode]);

    return (
        <>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white font-inter transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <h2 className="mt-4 text-2xl font-semibold font-inter text-white">
                Update Employee
            </h2>
            <Form />
        </>
    );
};

export default UpdateEmployee;
