import { useNavigate, useParams } from "react-router-dom"
import backImg from "../../assets/images/back.svg"
import ImageButton from "../../shared/ImageButton"
import IncrementHistoryTable from "./ui/IncrementHistoryTable"
import { useEffect, useState } from "react"
import { useEmployees } from "./modal/EmployeesContext"
import Button from "../../shared/Button"
import IncrementModalForm from "./ui/IncreamentModalForm"

const IncreamentHistory = () => {
    const { employeesList, setEmployeeIncreamentList, addNewIncrement } = useEmployees();
    const [addIncreamentModalOpen, setAddIncreamentModalOpen] = useState(false)
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }
    const { employeeId } = useParams()
    useEffect(() => {
        console.log(employeesList, "Employee")
        if (employeesList.length > 0) {
            const foundEmployee = employeesList.find((emp) => emp?.id === employeeId);
            console.log(foundEmployee, "Found")
            setEmployeeIncreamentList(foundEmployee?.lastIncreament || [])
        }
        return () => {
            setEmployeeIncreamentList([]);
        };

    }, [employeesList, employeeId])

    const handleAddIncreamentModal = () => {
        setAddIncreamentModalOpen(true)
       window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }
    const handleCloseIncreamentModal = () => {
        setAddIncreamentModalOpen(false)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Increament History
            </h2>
            <div className="flex justify-between items-center mt-6">
                <p className="text-base md:text-lg lg:text-[21px] font-medium font-urbanist lg:leading-[180%] text-[#FFFFFF99]">
                    Employee Id is <span className="font-semibold">{employeeId}</span>
                </p>
                <Button onClick={handleAddIncreamentModal} buttonClasses="bodyBackground h-12 px-4 py-3 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
                    Add Increament
                </Button>
            </div>
            <IncrementHistoryTable />
            {addIncreamentModalOpen &&
                <IncrementModalForm addIncrement={addNewIncrement} closeModal={handleCloseIncreamentModal} />
            }
        </>
    )
}

export default IncreamentHistory