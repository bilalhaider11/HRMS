import EmployeeTable from "./ui/EmployeeTable"
import { useNavigate } from "react-router-dom";
import { useEmployees } from "./modal/EmployeesContext";
import { fetchEmployees } from "./api/employeesApi";
import { UserPlus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const PAGE_SIZES = [10, 25, 50];

const EmployeesBody = () => {
    const { setEditingEmployee, setEmployeesList } = useEmployees()
    const navigate = useNavigate()

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);

    const loadEmployees = useCallback(async (p: number, q: string, size?: number) => {
        setLoading(true);
        try {
            const data = await fetchEmployees(p, size || pageSize, undefined, q || undefined);
            setEmployeesList(data.employees);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
            setPage(data.page);
        } catch (error) {
            console.error("Failed to load employees:", error);
        }
        setLoading(false);
    }, [setEmployeesList, pageSize]);

    useEffect(() => {
        loadEmployees(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = () => {
        setSearch(searchInput);
        loadEmployees(1, searchInput);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        loadEmployees(1, "");
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        loadEmployees(1, search, newSize);
    };

    const handlePrev = () => {
        if (page > 1) loadEmployees(page - 1, search);
    };

    const handleNext = () => {
        if (page < totalPages) loadEmployees(page + 1, search);
    };

    const registerEmployee = () => {
        setEditingEmployee(null)
        navigate("register-employees")
    }

    return (
        <div>
            {/* Page heading */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white font-inter">Employees</h1>
                    <p className="text-sm text-slate-400 font-inter mt-1">Manage your team members and their information</p>
                </div>
                <button
                    type="button"
                    onClick={registerEmployee}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Register Employee
                </button>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 mb-6 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search by name, code, email, or designation..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-inter placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
                {search && (
                    <button
                        onClick={handleClearSearch}
                        className="text-xs text-slate-400 hover:text-white font-inter px-2 py-1 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Table */}
            {!loading && <EmployeeTable />}

            {/* Pagination */}
            {!loading && totalCount > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-slate-400 font-inter">
                            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
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
                    {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrev}
                            disabled={page <= 1}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => loadEmployees(p, search)}
                                className={`w-8 h-8 rounded-lg text-sm font-inter transition-colors ${
                                    p === page
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={handleNext}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!loading && totalCount === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400 font-inter text-sm">
                        {search ? `No employees found for "${search}"` : "No employees yet"}
                    </p>
                </div>
            )}
        </div>
    )
}

export default EmployeesBody
