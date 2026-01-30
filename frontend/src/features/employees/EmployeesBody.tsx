import EmployeeTable from "./ui/EmployeeTable"
import Button from "../../shared/Button"
import { useNavigate } from "react-router-dom";
import registerIcon from "../../assets/images/register.svg"
import { useEmployees } from "./modal/EmployeesContext";

const EmployeesBody = () => {
    const {setEditingEmployee} = useEmployees()
    const navigate = useNavigate()
    const registerEmployee = () => {
        setEditingEmployee(null)
        navigate("register-employees")
    }
    return (

        <>
            <Button type="button" onClick={registerEmployee} buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                    <img src={registerIcon} alt="date" className="w-full h-full" />
                </div>
                Register Employee
            </Button>
            <EmployeeTable />
        </>
    )
}

export default EmployeesBody