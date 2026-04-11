import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, ClipboardList } from "lucide-react";
import { fetchAttendanceRecords } from "./api/attendanceApi";

interface AttendanceRecord {
  id: number;
  date: string;
  timestamp: string;
  employee_code: string;
  employee_name: string;
  status: number;
  status_label: string;
  serial_number: string;
}

const inputStyles =
  "px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-inter placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

const AttendancePage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // updated from API response
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "", endDate: "", search: "",
  });

  const PAGE_SIZE = 50;

  const load = useCallback(async (p: number, filters: typeof appliedFilters) => {
    setLoading(true);
    try {
      const data = await fetchAttendanceRecords(
        p, PAGE_SIZE,
        filters.startDate || undefined,
        filters.endDate || undefined,
        filters.search || undefined,
      );
      setRecords(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      console.error("Failed to load attendance records:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(1, appliedFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    const filters = { startDate, endDate, search };
    setAppliedFilters(filters);
    load(1, filters);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
    const empty = { startDate: "", endDate: "", search: "" };
    setAppliedFilters(empty);
    load(1, empty);
  };

  const hasFilters = startDate || endDate || search;

  const formatTime = (iso: string) => {
    // Python isoformat() returns +00:00 offset, not Z — new Date() handles both formats
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const thClass = "py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter";
  const tdClass = "py-3.5 px-4 text-sm text-slate-200 font-inter";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white font-inter">Attendance</h1>
          <p className="text-sm text-slate-400 font-inter mt-1">
            {totalCount > 0 ? `${totalCount.toLocaleString()} records` : "Raw attendance logs from biometric devices"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-inter">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputStyles}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-inter">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputStyles}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs text-slate-400 font-inter">Search employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                placeholder="Name or employee code"
                className={`${inputStyles} pl-9 w-full`}
              />
            </div>
          </div>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors"
          >
            Apply
          </button>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-slate-400 hover:text-white text-sm font-inter rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-inter text-sm">No attendance records found.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-800/50">
                <tr className="border-b border-slate-700">
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Time</th>
                  <th className={thClass}>Employee Code</th>
                  <th className={thClass}>Employee Name</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Device</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className={tdClass}>{formatDate(r.date)}</td>
                    <td className={`${tdClass} font-mono text-slate-300`}>{formatTime(r.timestamp)}</td>
                    <td className={`${tdClass} font-mono text-slate-300`}>{r.employee_code}</td>
                    <td className={tdClass}>
                      <span className={r.employee_name === "—" ? "text-slate-500" : "text-white"}>
                        {r.employee_name}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-inter ${
                        r.status === 0
                          ? "bg-emerald-500/10 text-emerald-400"
                          : r.status === 1
                          ? "bg-red-500/10 text-red-400"
                          : "bg-slate-700 text-slate-300"
                      }`}>
                        {r.status_label}
                      </span>
                    </td>
                    <td className={`${tdClass} text-slate-400 font-mono text-xs`}>{r.serial_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
              <p className="text-xs text-slate-400 font-inter">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => load(page - 1, appliedFilters)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-inter text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => load(page + 1, appliedFilters)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-inter text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AttendancePage;
