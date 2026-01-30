import ImageButton from "../../shared/ImageButton";
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom";
import Form from "./ui/Form"
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useEmployees } from "./modal/EmployeesContext";

const UpdateEmployee = () => {
    const { employeesList, editEmployeeData, editingEmployee, setEditingEmployee } = useEmployees();

    const { employeeId } = useParams()
    console.log(employeeId, "ID")
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }
    useEffect(() => {
        console.log(employeesList, "Employee")
        if (employeesList.length > 0 && editingEmployee === null) {
            const foundEmployee = employeesList.find((emp) => emp?.id === employeeId);
            console.log(foundEmployee, "Found")
            if (foundEmployee) {
                editEmployeeData(foundEmployee);
            }
        }
        return () => {
            setEditingEmployee(null);
        };
    }, [employeesList, employeeId])
    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Update the Employee
            </h2>
            <Form />
        </>
    )
}

export default UpdateEmployee