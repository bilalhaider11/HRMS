
import Button from "../../../shared/Button"
import Box from "../../../shared/Box"
import { FinanceTableData } from "../modal/FinanceContext"
import { useFinance } from "../modal/FinanceContext"
import { useNavigate } from "react-router-dom"

const FinanceTable = () => {
    const { financeList } = useFinance()
    const tableDataClassName = "py-4 px-4 text-sm text-slate-200 font-inter w-[10%] truncate"
    const tableHeadingClassName = "py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[10%]"
    const navigate = useNavigate()

    const handleUpdate = (finance: FinanceTableData) => {
        navigate(`/finance/update-finance/${finance.FinanceId}`);
    }

    return (
        <>
            <Box boxMainDivClasses="mt-[30px]">
                <div className="w-full overflowXAuto">
                    <table className="w-full min-w-[1024px]">
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
                                    Tax
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Cheque #
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Category
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Added By
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Created At
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {financeList.map((data: FinanceTableData, index: number) => (
                                <tr key={index} className="border-t border-solid border-slate-800">
                                    <td className={`${tableDataClassName}`}>
                                        {data.Date}
                                    </td>
                                    <td className={`${tableDataClassName} w-[20%]`}>
                                        <div className="w-full truncate max-w-[200px]">
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
                                        {data.CreatedAt}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        <Button type="button" onClick={() => handleUpdate(data)} buttonClasses="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-inter">
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
        </>
    )
}

export default FinanceTable
