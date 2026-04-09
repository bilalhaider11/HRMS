import FinanceTable from "./ui/FinanceTable"
import Form from "./ui/Form"
import { Plus, ChevronDown, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Wallet, ChevronUp } from "lucide-react"
import { useFinance } from "./modal/FinanceContext"
import { useState, useCallback, useEffect, useRef } from "react"
import { fetchMonthlySummary } from "./api/financeApi"
import { useNavigate } from "react-router-dom"

const PAGE_SIZES = [10, 25, 50, 100];

const getDefaultDateRange = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { from: fmt(from), to: fmt(to) };
};

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
    const {
        financeCategoriesList, bankAccountsList,
        selectedBankAccountId, setSelectedBankAccountId,
        loadFinance,
        financePage, financeTotalPages, financeTotalCount, setEditingFinance,
    } = useFinance();

    const navigate = useNavigate();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
    const [pageSize, setPageSize] = useState(50);
    const [showFormModal, setShowFormModal] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const bankDropdownRef = useRef<HTMLDivElement>(null);

    const [monthlyData, setMonthlyData] = useState<MonthRow[]>([]);
    const [showMonthly, setShowMonthly] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const defaultRange = getDefaultDateRange();
    const [dateFrom, setDateFrom] = useState(defaultRange.from);
    const [dateTo, setDateTo] = useState(defaultRange.to);

    const selectedAccount = bankAccountsList.find(a => a.id === selectedBankAccountId);

    // Reload when filters or bank account selection change
    useEffect(() => {
        if (selectedBankAccountId) {
            loadFinance(1, pageSize, dateFrom, dateTo, selectedCategoryId, selectedBankAccountId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFrom, dateTo, selectedCategoryId, selectedBankAccountId]);

    useEffect(() => {
        if (showMonthly && selectedBankAccountId) {
            fetchMonthlySummary(parseInt(selectedBankAccountId), selectedYear)
                .then((d) => setMonthlyData(d.months || []))
                .catch(console.error);
        }
    }, [showMonthly, selectedYear, selectedBankAccountId]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node))
                setCategoryDropdownOpen(false);
            if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node))
                setBankDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const inputStyles = "text-sm px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const labelStyles = "text-xs font-medium text-slate-400 font-inter";

    const selectedCategoryName = selectedCategoryId
        ? financeCategoriesList.find(c => c.id === selectedCategoryId)?.name || "Unknown"
        : "All Categories";

    const selectCategory = useCallback((id: string) => {
        setSelectedCategoryId(id);
        setCategoryDropdownOpen(false);
    }, []);

    const handlePageChange = (newPage: number) => {
        loadFinance(newPage, pageSize, dateFrom, dateTo, selectedCategoryId, selectedBankAccountId);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        loadFinance(1, newSize, dateFrom, dateTo, selectedCategoryId, selectedBankAccountId);
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
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white font-inter">Finance</h1>
                    <p className="text-sm text-slate-400 font-inter mt-1">Track financial transactions, salaries, and expenses</p>
                </div>
                <button
                    onClick={openAddModal}
                    disabled={!selectedBankAccountId}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors"
                    title={!selectedBankAccountId ? "Select a bank account first" : ""}
                >
                    <Plus className="w-4 h-4" />
                    New Record
                </button>
            </div>

            {/* Bank Account Selector */}
            {bankAccountsList.length === 0 ? (
                <div className="mb-6 p-5 bg-slate-900 border border-slate-800 border-dashed rounded-2xl text-center">
                    <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-inter mb-3">No bank accounts configured yet.</p>
                    <button
                        onClick={() => navigate("/finance/bank-accounts")}
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-inter font-medium transition-colors"
                    >
                        Go to Bank Accounts →
                    </button>
                </div>
            ) : (
                <div className="mb-6 flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    {/* Dropdown */}
                    <div className="relative flex-shrink-0" ref={bankDropdownRef}>
                        <label className="block text-xs text-slate-500 font-inter mb-1">Bank Account</label>
                        <button
                            type="button"
                            onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-sm font-medium font-inter rounded-xl transition-colors min-w-[220px] justify-between"
                        >
                            {selectedAccount ? selectedAccount.account_name : "Select account"}
                            <ChevronDown className={`w-4 h-4 transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {bankDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[260px] bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                                {bankAccountsList.map((acc) => (
                                    <button
                                        key={acc.id}
                                        type="button"
                                        onClick={() => { setSelectedBankAccountId(acc.id || ""); setBankDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm font-inter transition-colors border-b border-slate-700 last:border-0 ${selectedBankAccountId === acc.id ? "text-indigo-400 bg-slate-700/50" : "text-slate-300 hover:bg-slate-700"}`}
                                    >
                                        <div className="font-medium">{acc.account_name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{acc.bank_name} · {acc.account_number}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected account stats */}
                    {selectedAccount && (
                        <div className="flex items-center gap-6 ml-2">
                            <div>
                                <p className="text-xs text-slate-500 font-inter">Current Balance</p>
                                <p className={`text-lg font-semibold font-inter ${(selectedAccount.current_balance ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {(selectedAccount.current_balance ?? 0) < 0 ? "-" : ""}{fmt(Math.abs(selectedAccount.current_balance ?? 0))}
                                </p>
                            </div>
                            <div className="border-l border-slate-700 pl-6">
                                <p className="text-xs text-slate-500 font-inter">Income</p>
                                <p className="text-sm font-semibold font-inter text-emerald-400">
                                    <TrendingUp className="w-3 h-3 inline mr-1" />{fmt(selectedAccount.total_income ?? 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-inter">Expense</p>
                                <p className="text-sm font-semibold font-inter text-red-400">
                                    <TrendingDown className="w-3 h-3 inline mr-1" />-{fmt(selectedAccount.total_expense ?? 0)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Monthly Summary Toggle */}
            {selectedBankAccountId && (
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
                                <span className="text-sm font-semibold text-slate-300 font-inter">
                                    {selectedAccount?.account_name} — {selectedYear}
                                </span>
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
            )}

            {/* Filters */}
            {selectedBankAccountId && (
                <div className="flex flex-wrap items-end gap-4 mb-6">
                    <div className="flex flex-col gap-1">
                        <label className={labelStyles}>From</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputStyles} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={labelStyles}>To</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputStyles} />
                    </div>

                    <div className="relative" ref={categoryDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-sm font-medium font-inter rounded-xl transition-colors min-w-[180px] justify-between"
                        >
                            {selectedCategoryName}
                            <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {categoryDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[200px] bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                                <button type="button" onClick={() => selectCategory("")}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors border-b border-slate-700 ${selectedCategoryId === "" ? "text-indigo-400 bg-slate-700/50" : "text-slate-300 hover:bg-slate-700"}`}>
                                    All Categories
                                </button>
                                {financeCategoriesList.map((cat) => (
                                    <button key={cat.id} type="button" onClick={() => selectCategory(cat.id || "")}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors border-b border-slate-700 last:border-0 flex items-center gap-2 ${selectedCategoryId === cat.id ? "text-indigo-400 bg-slate-700/50" : "text-slate-300 hover:bg-slate-700"}`}>
                                        <span className="w-3 h-3 rounded-full inline-block border border-slate-600 flex-shrink-0" style={{ backgroundColor: cat.colorCode }} />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="button" onClick={resetFilters} className="px-3 py-2.5 text-sm text-slate-400 hover:text-white font-inter transition-colors">
                        Reset
                    </button>
                </div>
            )}

            {/* Table */}
            {selectedBankAccountId && <FinanceTable />}

            {/* Pagination */}
            {selectedBankAccountId && financeTotalCount > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-slate-400 font-inter">
                            Showing {((financePage - 1) * pageSize) + 1}–{Math.min(financePage * pageSize, financeTotalCount)} of {financeTotalCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-inter">Per page:</span>
                            {PAGE_SIZES.map((size) => (
                                <button key={size} onClick={() => handlePageSizeChange(size)}
                                    className={`px-2 py-1 text-xs rounded font-inter transition-colors ${size === pageSize ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    {financeTotalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => handlePageChange(financePage - 1)} disabled={financePage <= 1}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: financeTotalPages }, (_, i) => i + 1).map((p) => (
                                <button key={p} onClick={() => handlePageChange(p)}
                                    className={`w-8 h-8 rounded-lg text-sm font-inter transition-colors ${p === financePage ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => handlePageChange(financePage + 1)} disabled={financePage >= financeTotalPages}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors">
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
                            <h3 className="text-lg font-semibold text-white font-inter">Add Finance Record</h3>
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
    );
};

export default FinanceBody;
