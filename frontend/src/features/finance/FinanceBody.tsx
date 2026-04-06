import FinanceTable from "./ui/FinanceTable"
import Form from "./ui/Form"
import { Plus, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useFinance } from "./modal/FinanceContext"
import { useState, useCallback, useEffect, useRef } from "react"

const PAGE_SIZES = [10, 25, 50, 100];

const getDefaultDateRange = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { from: fmt(from), to: fmt(to) };
};

const FinanceBody = () => {
    const { financeCategoriesList, loadFinance, financePage, financeTotalPages, financeTotalCount, setEditingFinance } = useFinance()
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [pageSize, setPageSize] = useState(50);
    const [showFormModal, setShowFormModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        loadFinance(newPage, pageSize);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        loadFinance(1, newSize);
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
            </div>

            <FinanceTable filterCategoryId={selectedCategoryId} dateFrom={dateFrom} dateTo={dateTo} />

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
