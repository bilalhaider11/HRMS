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
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[30%] pl-6">
                                    Employee
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[20%]">
                                    Designation
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[20%]">
                                    Status
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[20%]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeesList.map((data: EmployeeTableData, index: number) => (
                                <tr key={index} className="border-t border-solid border-slate-800"
                                >
                                    <td className="py-4 px-4 w-[30%] flex items-center gap-4 md:gap-[29px]">
                                        <img src={ProfileImage} alt="Profile" className="sm:w-10 sm:h-10 w-[30px] h-[30px]" />
                                        <div className="flex flex-col items-start">
                                            <button onClick={() => handleNameClick(data)} className="text-sm font-inter text-slate-200 whitespace-nowrap">
                                                {data.name}
                                            </button>
                                            {data.id && (
                                                <span className="text-xs text-slate-500 font-inter">{data.id}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="w-[20%] py-4 px-4 text-sm text-slate-300 font-inter">
                                        {data.designation || <span className="text-slate-600">—</span>}
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
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => handleHistoryClick(data)} buttonClasses="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-inter">
                                                History
                                            </Button>
                                            <Button onClick={() => deleteEmployee(data)} buttonClasses="text-sm px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-inter">
                                                Deactivate
                                            </Button>
                                        </div>
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
                    <h1 className="text-lg text-center font-inter font-semibold text-white border-b border-slate-800 p-5 mb-6">Deactivate Employee</h1>
                    <div className="flex flex-col gap-3 px-5 mb-5">
                        <p className="text-sm font-inter text-slate-300">
                            Code: <span className="font-semibold text-white">{isEmployeeDelete.id}</span>
                        </p>
                        <p className="text-sm font-inter text-slate-300">
                            Name: <span className="font-semibold text-white">{isEmployeeDelete.name}</span>
                        </p>
                        <p className="text-sm font-inter text-slate-400 mt-2">
                            This will deactivate the employee. They will no longer appear in the active employees list.
                        </p>
                    </div>

                    <div className="border-t border-slate-800 py-4 px-5 flex justify-end gap-3">
                        <button onClick={deleteModalClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white font-inter transition-colors" type="button">
                            Cancel
                        </button>
                        <button onClick={() => handleEmployeeDelete(isEmployeeDelete)} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg font-inter transition-colors" type="button">
                            Deactivate
                        </button>
                    </div>
                </DeleteModal>
            }
        </>
    )
}

export default EmployeeTable
