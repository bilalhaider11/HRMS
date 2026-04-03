
import Button from "../../../shared/Button"
import Box from "../../../shared/Box"
import { FinanceTableData } from "../modal/FinanceContext"
import { useFinance } from "../modal/FinanceContext"
import { useNavigate } from "react-router-dom"
import DeleteModal from "../../../shared/DeleteModal"
import { useEffect, useRef } from "react"

const FinanceTable = () => {
    const { financeList, isDeleteModal, setIsDeleteModal, handleFinanceDelete } = useFinance()
    const tableDataClassName = "py-4 px-4 text-sm text-slate-200 font-inter w-[10%] truncate"
    const tableHeadingClassName = "py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[10%]"
    const navigate = useNavigate()

    const handleUpdate = (finance: FinanceTableData) => {
        navigate(`/finance/update-finance/${finance.FinanceId}`);
    }
    const deleteModalRef = useRef<HTMLDivElement>(null);

    const handleDeleteFinance = (finance: FinanceTableData) => {
        setIsDeleteModal(finance)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }
    const deleteModalClose = () => {
        setIsDeleteModal(null)
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
            <Box
                boxMainDivClasses={` mt-[30px] transition-all duration-500 delay-300`}
            >
                <div className="w-full overflowXAuto">
                    <table className="w-full min-w-[1992px]">
                        <thead className="bg-slate-800/50">
                            <tr className="border-b border-slate-700">
                                <th className={`${tableHeadingClassName}`}>
                                    Date
                                </th>
                                <th className={`${tableHeadingClassName} w-[20%]`}>
                                    Description
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Amount
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Tax Deduction
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Cheque Number
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Category ID
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Added By
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {financeList.map((data: FinanceTableData, index: number) => (
                                <tr key={index}>
                                    <td className={`${tableDataClassName}`}>
                                        {data.Date}
                                    </td>
                                    <td className={`${tableDataClassName} w-[20%]`}>
                                        <div className="w-full truncate max-w-[340px]">
                                            {data.Description}
                                        </div>
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        {data.Amount}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        {data.TaxDeductions}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        {data.ChequeNumber}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        {data.CategoryID}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        {data.AddedBy}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        <div className="flex items-center h-full w-full justify-end gap-4">
                                            <Button type="button" onClick={() => handleUpdate(data)} buttonClasses="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-inter">
                                                Update
                                            </Button>
                                            <Button type="button" onClick={() => handleDeleteFinance(data)} buttonClasses="text-sm px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-inter">
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
            {isDeleteModal &&
                <DeleteModal ref={deleteModalRef} closeButtonCLick={deleteModalClose}>
                    <h1 className="text-2xl text-center font-urbanist leading-[150%] text-white border-b border-solid border-[#CDD6D7] p-6 mb-8">Delete Finance</h1>
                    <div className="flex flex-col gap-4 px-5 mb-5">
                        <p className="text-xl font-poppins text-slate-200">
                            Employee Id: <span className="font-bold">{isDeleteModal.FinanceId}</span>
                        </p>
                        <p className="text-xl font-poppins text-slate-200">
                            Employee Name: <span className="font-bold">{isDeleteModal.Amount}</span>
                        </p>
                        <p className="text-xl font-poppins text-slate-200">
                            Employee Status: <span className="font-bold">{isDeleteModal.CategoryID}</span>
                        </p>

                    </div>

                    <div className="border-t border-solid border-[#CDD6D7] py-6 px-5 flex justify-center">

                        <Button onClick={() => handleFinanceDelete(isDeleteModal)} buttonClasses="flex justify-center mx-auto min-h-[64px] px-11 pb-[15px] pt-4 border border-solid border-[#CDD6D7] bg-[#283573] font-urbanist font-semibold text-xl leading-[160%] rounded-[15px] text-white" type="button">
                            Confirm Delete
                        </Button>
                    </div>
                </DeleteModal>
            }
        </>
    )
}

export default FinanceTable