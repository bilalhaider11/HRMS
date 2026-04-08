
import Button from "../../../shared/Button"
import Box from "../../../shared/Box"
import { FinanceTableData } from "../modal/FinanceContext"
import { useFinance } from "../modal/FinanceContext"
import { useNavigate } from "react-router-dom"
import { History, X } from "lucide-react"
import { useState } from "react"
import { fetchEditHistory } from "../api/financeApi"

interface EditHistoryEntry {
    id: number;
    field_name: string;
    old_value: string;
    new_value: string;
    edited_by: string;
    edited_at: string;
}

const hexToRowBg = (hex: string) => {
    if (!hex || hex.length < 7 || hex[0] !== '#') return undefined;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return undefined;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const alpha = brightness < 80 ? 0.9 : 0.75;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const FinanceTable = () => {
    const { financeList, financeSummary } = useFinance()
    const tableDataClassName = "py-4 px-4 text-sm text-slate-200 font-inter w-[10%] truncate"
    const tableHeadingClassName = "py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[10%]"
    const navigate = useNavigate()

    const [historyModal, setHistoryModal] = useState<{ financeId: string; entries: EditHistoryEntry[] } | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    const handleUpdate = (finance: FinanceTableData) => {
        navigate(`/finance/update-finance/${finance.FinanceId}`);
    }

    const handleShowHistory = async (finance: FinanceTableData) => {
        setHistoryLoading(true);
        try {
            const data = await fetchEditHistory(parseInt(finance.FinanceId || "0"));
            setHistoryModal({ financeId: finance.FinanceId || "", entries: data });
        } catch (error) {
            console.error("Failed to load edit history:", error);
        }
        setHistoryLoading(false);
    };

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
                            {financeList.map((data: FinanceTableData, index: number) => {
                                const bgColor = data.CategoryColor ? hexToRowBg(data.CategoryColor) : undefined;
                                const rowBg = bgColor ? { backgroundColor: bgColor } : undefined;
                                return (
                                <tr key={index} className="border-t border-solid border-slate-800">
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        {data.Date}
                                    </td>
                                    <td className={`${tableDataClassName} w-[20%]`} style={rowBg}>
                                        <div className="w-full truncate max-w-[200px]" title={data.Description}>
                                            {data.Description}
                                        </div>
                                    </td>
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        {(() => {
                                            const isIncome = data.CategoryName?.startsWith("Income");
                                            const formatted = data.Amount?.toLocaleString();
                                            return isIncome ? formatted : `-${formatted}`;
                                        })()}
                                    </td>
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        {data.TaxDeductions?.toLocaleString()}
                                    </td>
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        {data.ChequeNumber || "—"}
                                    </td>
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        {data.CategoryName}
                                    </td>
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        {data.AddedBy}
                                    </td>
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        {data.CreatedAt}
                                    </td>
                                    <td className={`${tableDataClassName}`} style={rowBg}>
                                        <div className="flex items-center gap-2">
                                            {data.HasEdits && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowHistory(data)}
                                                    className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors"
                                                    title="View edit history"
                                                >
                                                    <History className="w-4 h-4" />
                                                </button>
                                            )}
                                            <Button type="button" onClick={() => handleUpdate(data)} buttonClasses="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-inter">
                                                Edit
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                        {financeList.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 border-slate-700">
                                    <td className="py-4 px-4 text-sm font-semibold text-slate-300 font-inter" colSpan={2}>Totals (filtered)</td>
                                    <td className="py-4 px-4 text-sm font-semibold font-inter text-white" colSpan={7}>
                                        <div className="flex items-center gap-6">
                                            <span className="text-emerald-400">Income: {financeSummary.total_income.toLocaleString()}</span>
                                            <span className="text-red-400">Expense: -{financeSummary.total_expense.toLocaleString()}</span>
                                            <span className={financeSummary.net >= 0 ? "text-emerald-400" : "text-red-400"}>
                                                Net: {financeSummary.net >= 0 ? "" : "-"}{Math.abs(financeSummary.net).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Box>

            {/* Edit History Modal */}
            {historyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setHistoryModal(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-slate-700">
                            <h3 className="text-lg font-semibold text-white font-inter">
                                Edit History — Record #{historyModal.financeId}
                            </h3>
                            <button onClick={() => setHistoryModal(null)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-auto max-h-[60vh] p-5">
                            {historyLoading ? (
                                <p className="text-slate-400 text-sm font-inter text-center py-8">Loading...</p>
                            ) : historyModal.entries.length === 0 ? (
                                <p className="text-slate-400 text-sm font-inter text-center py-8">No edit history found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {(() => {
                                        // Group entries by date (day)
                                        const groups: { date: string; entries: EditHistoryEntry[] }[] = [];
                                        historyModal.entries.forEach((entry) => {
                                            const dateKey = new Date(entry.edited_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                                            const last = groups[groups.length - 1];
                                            if (last && last.date === dateKey) {
                                                last.entries.push(entry);
                                            } else {
                                                groups.push({ date: dateKey, entries: [entry] });
                                            }
                                        });
                                        return groups.map((group, gi) => (
                                            <div key={gi} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                                <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700">
                                                    <span className="text-xs font-medium text-slate-400 font-inter">
                                                        {group.date}
                                                    </span>
                                                </div>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-slate-700/50">
                                                            <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-inter">Time</th>
                                                            <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-inter">Field</th>
                                                            <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-inter">Old Value</th>
                                                            <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-inter">New Value</th>
                                                            <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-inter">Edited By</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {group.entries.map((entry) => (
                                                            <tr key={entry.id} className="border-t border-slate-700/30">
                                                                <td className="py-2.5 px-4 text-sm text-slate-400 font-inter whitespace-nowrap">{new Date(entry.edited_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase()}</td>
                                                                <td className="py-2.5 px-4 text-sm text-slate-300 font-inter capitalize">{entry.field_name.replace(/_/g, ' ')}</td>
                                                                <td className="py-2.5 px-4 text-sm text-red-400 font-inter">{entry.old_value}</td>
                                                                <td className="py-2.5 px-4 text-sm text-green-400 font-inter">{entry.new_value}</td>
                                                                <td className="py-2.5 px-4 text-sm text-slate-400 font-inter">{entry.edited_by}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default FinanceTable
