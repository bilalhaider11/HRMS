
import Button from "../../../shared/Button"
import Box from "../../../shared/Box"
import { FinanceTableData } from "../modal/FinanceContext"
import { useFinance } from "../modal/FinanceContext"
import { useNavigate } from "react-router-dom"
import DeleteModal from "../../../shared/DeleteModal"
import { useEffect, useRef } from "react"

const FinanceTable = () => {
    const { financeList, isDeleteModal, setIsDeleteModal, handleFinanceDelete } = useFinance()
    const tableDataClassName = "py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-white w-[10%] pl-3 pr-10 text-right truncate"
    const tableHeadingClassName = "py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[10%] pl-3 pr-10 text-right"
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
    }, []);

    return (
        <>
            <Box
                boxMainDivClasses={` mt-[30px] transition-all duration-500 delay-300`}
            >
                <div className="w-full overflowXAuto">
                    <table className="w-full min-w-[1992px]">
                        <thead>
                            <tr className="">
                                <th className={`${tableHeadingClassName} !text-left !px-3`}>
                                    Date
                                </th>
                                <th className={`${tableHeadingClassName} !w-[20%]`}>
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
                                    Company ID
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {financeList.map((data: FinanceTableData, index: number) => (
                                <tr key={index}>
                                    <td className={`${tableDataClassName} !text-left !px-3`}>
                                        {data.Date}
                                    </td>
                                    <td className={`${tableDataClassName} !w-[20%]`}>
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
                                        {data.CompanyID}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        <div className="flex items-center h-full w-full justify-end gap-4">
                                            <Button type="button" onClick={() => handleUpdate(data)} buttonClasses="bodyBackground px-4 py-3 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
                                                Update
                                            </Button>
                                            <Button type="button" onClick={() => handleDeleteFinance(data)} buttonClasses="bodyBackground px-4 py-3 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
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
                        <p className="text-xl font-poppins text-white">
                            Employee Id: <span className="font-bold">{isDeleteModal.FinanceId}</span>
                        </p>
                        <p className="text-xl font-poppins text-white">
                            Employee Name: <span className="font-bold">{isDeleteModal.Amount}</span>
                        </p>
                        <p className="text-xl font-poppins text-white">
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