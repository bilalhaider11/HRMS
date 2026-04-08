import FinanceTable from "./ui/FinanceTable"
import Form from "./ui/Form"
import { Plus, ChevronDown, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Wallet, ChevronUp, RotateCcw } from "lucide-react"
import { useFinance } from "./modal/FinanceContext"
import { useState, useCallback, useEffect, useRef } from "react"
import { fetchBalance, fetchMonthlySummary } from "./api/financeApi"

const PAGE_SIZES = [10, 25, 50, 100];

const getDefaultDateRange = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { from: fmt(from), to: fmt(to) };
};

interface BalanceData {
    opening_balance: number;
    total_income: number;
    total_expense: number;
    net_transactions: number;
    current_balance: number;
}

interface MonthRow {
    month: number;
    month_name: string;
    opening_balance: number;
    income: number;
    expense: number;
    net: number;
    closing_balance: number;
}

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const FinanceBody = () => {
    const { financeCategoriesList, loadFinance, financePage, financeTotalPages, financeTotalCount, setEditingFinance } = useFinance()
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [pageSize, setPageSize] = useState(50);
    const [showFormModal, setShowFormModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthRow[]>([]);
    const [showMonthly, setShowMonthly] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchBalance().then(setBalance).catch(console.error);
    }, []);

    useEffect(() => {
        if (showMonthly) {
            fetchMonthlySummary(selectedYear).then((d) => setMonthlyData(d.months || [])).catch(console.error);
        }
    }, [showMonthly, selectedYear]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    const defaultRange = getDefaultDateRange();
    const [dateFrom, setDateFrom] = useState(defaultRange.from);
    const [dateTo, setDateTo] = useState(defaultRange.to);

    // Reload when filters change (reset to page 1)
    useEffect(() => {
        loadFinance(1, pageSize, dateFrom, dateTo, selectedCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFrom, dateTo, selectedCategoryId]);

    const inputStyles = "text-sm px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const labelStyles = "text-xs font-medium text-slate-400 font-inter";

    const selectedCategoryName = selectedCategoryId
        ? financeCategoriesList.find(c => c.id === selectedCategoryId)?.name || "Unknown"
        : "All Categories"

    const selectCategory = useCallback((id: string) => {
        setSelectedCategoryId(id)
        setDropdownOpen(false)
    }, [])

    const handlePageChange = (newPage: number) => {
        loadFinance(newPage, pageSize, dateFrom, dateTo, selectedCategoryId);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        loadFinance(1, newSize, dateFrom, dateTo, selectedCategoryId);
    };

    const resetFilters = () => {
        const def = getDefaultDateRange();
        setDateFrom(def.from);
        setDateTo(def.to);
        setSelectedCategoryId("");
    };

    const openAddModal = () => {
        setEditingFinance(null);
        setShowFormModal(true);
        document.body.style.overflow = "hidden";
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setEditingFinance(null);
        document.body.style.overflow = "auto";
        // Refresh balance to reflect any newly added/updated records
        fetchBalance().then(setBalance).catch(console.error);
    };

    const refreshBalance = () => {
        fetchBalance().then(setBalance).catch(console.error);
        if (showMonthly) {
            fetchMonthlySummary(selectedYear).then((d) => setMonthlyData(d.months || [])).catch(console.error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white font-inter">Finance</h1>
                    <p className="text-sm text-slate-400 font-inter mt-1">Track financial transactions, salaries, and expenses</p>
                </div>
                <button onClick={openAddModal} type="button" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors">
                    <Plus className="w-4 h-4" />
                    New Record
                </button>
            </div>

            {/* Balance Summary Cards */}
            {balance && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs text-slate-400 font-inter">Current Balance</span>
                        </div>
                        <p className={`text-xl font-semibold font-inter ${balance.current_balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {balance.current_balance < 0 ? "-" : ""}{fmt(Math.abs(balance.current_balance))}
                        </p>
                        <p className="text-xs text-slate-500 font-inter mt-0.5">Opening: {fmt(balance.opening_balance)}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-slate-400 font-inter">Total Income</span>
                        </div>
                        <p className="text-xl font-semibold font-inter text-emerald-400">{fmt(balance.total_income)}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-slate-400 font-inter">Total Expense</span>
                        </div>
                        <p className="text-xl font-semibold font-inter text-red-400">-{fmt(balance.total_expense)}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-slate-400 font-inter">Net Transactions</span>
                            <button onClick={refreshBalance} className="ml-auto p-0.5 text-slate-500 hover:text-slate-300 transition-colors" title="Refresh balance">
                                <RotateCcw className="w-3 h-3" />
                            </button>
                        </div>
                        <p className={`text-xl font-semibold font-inter ${balance.net_transactions >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {balance.net_transactions < 0 ? "-" : ""}{fmt(Math.abs(balance.net_transactions))}
                        </p>
                    </div>
                </div>
            )}

            {/* Monthly Summary Toggle */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => setShowMonthly(!showMonthly)}
                    className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-inter font-medium transition-colors"
                >
                    {showMonthly ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Monthly Summary
                </button>
                {showMonthly && (
                    <div className="mt-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
                            <span className="text-sm font-semibold text-slate-300 font-inter">Monthly Balance — {selectedYear}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 text-slate-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                <span className="text-sm text-white font-inter w-10 text-center">{selectedYear}</span>
                                <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 text-slate-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        {["Month", "Opening Balance", "Income", "Expense", "Net", "Closing Balance"].map(h => (
                                            <th key={h} className="py-2.5 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyData.map((row) => (
                                        <tr key={row.month} className="border-t border-slate-800">
                                            <td className="py-3 px-4 text-sm text-slate-300 font-inter">{row.month_name}</td>
                                            <td className="py-3 px-4 text-sm text-slate-300 font-inter">{fmt(row.opening_balance)}</td>
                                            <td className="py-3 px-4 text-sm text-emerald-400 font-inter">{row.income > 0 ? fmt(row.income) : "—"}</td>
                                            <td className="py-3 px-4 text-sm text-red-400 font-inter">{row.expense > 0 ? `-${fmt(row.expense)}` : "—"}</td>
                                            <td className={`py-3 px-4 text-sm font-inter font-medium ${row.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                {row.net === 0 ? "—" : `${row.net < 0 ? "-" : ""}${fmt(Math.abs(row.net))}`}
                                            </td>
                                            <td className={`py-3 px-4 text-sm font-inter font-semibold ${row.closing_balance >= 0 ? "text-white" : "text-red-400"}`}>
                                                {fmt(row.closing_balance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className={inputStyles}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelStyles}>To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className={inputStyles}
                    />
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-sm font-medium font-inter rounded-xl transition-colors min-w-[180px] justify-between"
                    >
                        {selectedCategoryName}
                        <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[200px] bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                            <button
                                type="button"
                                onClick={() => selectCategory("")}
                                className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors border-b border-slate-700 ${selectedCategoryId === "" ? "text-indigo-400 bg-slate-700/50" : "text-slate-300 hover:bg-slate-700"}`}
                            >
                                All Categories
                            </button>
                            {financeCategoriesList.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => selectCategory(cat.id || "")}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors border-b border-slate-700 last:border-0 flex items-center gap-2 ${selectedCategoryId === cat.id ? "text-indigo-400 bg-slate-700/50" : "text-slate-300 hover:bg-slate-700"}`}
                                >
                                    <span className="w-3 h-3 rounded-full inline-block border border-slate-600 flex-shrink-0" style={{ backgroundColor: cat.colorCode }} />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-2.5 text-sm text-slate-400 hover:text-white font-inter transition-colors"
                    title="Reset to current month"
                >
                    Reset
                </button>
            </div>

            <FinanceTable />

            {/* Pagination */}
            {financeTotalCount > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-slate-400 font-inter">
                            Showing {((financePage - 1) * pageSize) + 1}–{Math.min(financePage * pageSize, financeTotalCount)} of {financeTotalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-inter">Per page:</span>
                            {PAGE_SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handlePageSizeChange(size)}
                                    className={`px-2 py-1 text-xs rounded font-inter transition-colors ${
                                        size === pageSize
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    {financeTotalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(financePage - 1)}
                                disabled={financePage <= 1}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: financeTotalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`w-8 h-8 rounded-lg text-sm font-inter transition-colors ${
                                        p === financePage
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(financePage + 1)}
                                disabled={financePage >= financeTotalPages}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add Finance Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10" onClick={closeFormModal}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-slate-700">
                            <h3 className="text-lg font-semibold text-white font-inter">
                                Add Finance Record
                            </h3>
                            <button onClick={closeFormModal} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5">
                            <Form onClose={closeFormModal} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FinanceBody
