import { useEffect, useRef, useState } from "react"
import ProfileImage from "../../../assets/images/profileIcon.svg"
import { EmployeeTableData } from "../modal/EmployeesContext"
import Box from "../../../shared/Box";
import useIntersectionObserver from "../../../shared/UseIntersectionObserver";
import Button from "../../../shared/Button";
import { useEmployees } from "../modal/EmployeesContext";
import { useNavigate } from "react-router-dom";
import StatusModal from "./StatusModal";
import DeleteModal from "shared/DeleteModal";



console.log("table body")

const EmployeeTable = () => {
    const { employeesList, updateStatus, handleEmployeeDelete, isEmployeeDelete, setIsEmployeeDelete } = useEmployees();
    const navigate = useNavigate();
    const [currentEmployee, setCurrentEmployee] = useState<EmployeeTableData | null>(null)

    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 }) as [
        React.RefObject<HTMLDivElement>,
        boolean
    ];
    const deleteModalRef = useRef<HTMLDivElement>(null);

    const [hasAnimated, setHasAnimated] = useState<boolean>(false);

    useEffect(() => {
        if (isVisible && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isVisible, hasAnimated]);




    const handleNameClick = (employee: EmployeeTableData) => {
        console.log(employee,)
        navigate(`/employees/update-employees/${employee.id}`);
    };

    const handleHistoryClick = (employee: EmployeeTableData) => {
        navigate(`/employees/increament-history/${employee.id}`)
    }

    const statusModalOpen = (employee: EmployeeTableData) => {
        setCurrentEmployee(employee)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }

    const updateStatusText = (id: string, newStatus: string) => {
        updateStatus(id, newStatus)
        setCurrentEmployee(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    const closeStatusModal = () => {
        setCurrentEmployee(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    const deleteEmployee = (employee: EmployeeTableData) => {
        setIsEmployeeDelete(employee)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }

    const deleteModalClose = () => {
        setIsEmployeeDelete(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                deleteModalRef.current &&
                !deleteModalRef.current.contains(event.target as Node)
            ) {
                deleteModalClose()
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <>
            <Box ref={ref}
                boxMainDivClasses={` mt-[30px] transition-all duration-500 delay-300 ${hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
            >
                <div className="w-full overflowXAuto">
                    <table className="w-full min-w-[1024px]">
                        <thead className="bg-slate-800/50">
                            <tr className="border-b border-slate-700">
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[40%] pl-6">
                                    Name
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[20%]">
                                    Status
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[20%]">
                                    Increment
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[20%]">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeesList.map((data: EmployeeTableData, index: number) => (
                                <tr key={index} className="border-t border-solid border-slate-800"
                                >
                                    <td className="py-4 px-4 w-[40%] flex items-center gap-4 md:gap-[29px]">
                                        <img src={ProfileImage} alt="Profile" className="sm:w-10 sm:h-10 w-[30px] h-[30px]" />
                                        <button onClick={() => handleNameClick(data)} className="text-sm font-inter text-slate-200 whitespace-nowrap">
                                            {data.name}
                                        </button>
                                    </td>
                                    <td className="w-[20%] py-4 px-4 text-sm text-slate-200 font-inter">
                                        <button type="button" onClick={() => statusModalOpen(data)}
                                            className={`rounded-lg px-[15px] h-6 md:h-[30px] text-xs md:text-[15px] md:leading-6 font-medium font-inter pt-px flex items-center w-fit ${data.status === "Active"
                                                ? "text-emerald-400 bg-emerald-400/10"
                                                : "text-amber-400 bg-amber-400/10"
                                                }`}
                                        >
                                            {data.status}
                                        </button>
                                    </td>
                                    <td className="w-[20%] py-4 px-4 text-sm text-slate-200 font-inter">
                                        <Button onClick={() => handleHistoryClick(data)} buttonClasses="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-inter">
                                            History
                                        </Button>
                                    </td>
                                    <td className="w-[20%] py-4 px-4 text-sm text-slate-200 font-inter">
                                        <Button onClick={() => deleteEmployee(data)} buttonClasses="text-sm px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-inter">
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
            {currentEmployee &&
                <StatusModal closeModal={closeStatusModal} employeeStatus={currentEmployee} onStatusUpdate={updateStatusText} />
            }
            {isEmployeeDelete &&
                <DeleteModal ref={deleteModalRef} closeButtonCLick={deleteModalClose}>
                    <h1 className="text-2xl text-center font-urbanist leading-[150%] text-white border-b border-solid border-[#CDD6D7] p-6 mb-8">Delete Increament</h1>
                    <div className="flex flex-col gap-4 px-5 mb-5">
                        <p className="text-xl font-poppins text-slate-200">
                            Employee Id: <span className="font-bold">{isEmployeeDelete.id}</span>
                        </p>
                        <p className="text-xl font-poppins text-slate-200">
                            Employee Name: <span className="font-bold">{isEmployeeDelete.name}</span>
                        </p>
                        <p className="text-xl font-poppins text-slate-200">
                            Employee Status: <span className="font-bold">{isEmployeeDelete.status}</span>
                        </p>

                    </div>

                    <div className="border-t border-solid border-[#CDD6D7] py-6 px-5 flex justify-center">

                        <Button onClick={() => handleEmployeeDelete(isEmployeeDelete)} buttonClasses="flex justify-center mx-auto min-h-[64px] px-11 pb-[15px] pt-4 border border-solid border-[#CDD6D7] bg-[#283573] font-urbanist font-semibold text-xl leading-[160%] rounded-[15px] text-white" type="button">
                            Confirm Delete
                        </Button>
                    </div>
                </DeleteModal>
            }
        </>
    )
}

export default EmployeeTable
