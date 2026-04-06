import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import IncrementHistoryTable from "./ui/IncrementHistoryTable"
import { useEffect, useState } from "react"
import { useEmployees } from "./modal/EmployeesContext"
import IncrementModalForm from "./ui/IncreamentModalForm"
import { fetchIncrements } from "./api/employeesApi"

const IncreamentHistory = () => {
    const { setEmployeeIncreamentList } = useEmployees();
    const [addIncreamentModalOpen, setAddIncreamentModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { employeeCode } = useParams()

    const loadIncrements = async () => {
        if (!employeeCode) return;
        setLoading(true);
        try {
            const data = await fetchIncrements(employeeCode);
            const mapped = (data || []).map((inc: any) => ({
                increamentId: String(inc.id),
                increamentAmount: inc.increment_amount,
                increamentDate: inc.effective_date,
                notes: inc.notes || "",
            }));
            setEmployeeIncreamentList(mapped);
        } catch (error) {
            console.error("Failed to load increments:", error);
            setEmployeeIncreamentList([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadIncrements();
        return () => {
            setEmployeeIncreamentList([]);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeCode])

    const handleAddIncreamentModal = () => {
        setAddIncreamentModalOpen(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }
    const handleCloseIncreamentModal = () => {
        setAddIncreamentModalOpen(false)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    const handleAddSuccess = () => {
        handleCloseIncreamentModal();
        loadIncrements();
    };

    return (
        <>
            <button onClick={() => navigate(-1)} className="mt-5 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-inter text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <div className="mt-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white font-inter">Increment History</h1>
                    <p className="text-sm text-slate-400 font-inter mt-1">Employee Code: <span className="text-white font-medium">{employeeCode}</span></p>
                </div>
                <button
                    onClick={handleAddIncreamentModal}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors"
                >
                    Add Increment
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <IncrementHistoryTable employeeCode={employeeCode || ""} onReload={loadIncrements} />
            )}

            {addIncreamentModalOpen && (
                <IncrementModalForm
                    employeeCode={employeeCode || ""}
                    onSuccess={handleAddSuccess}
                    closeModal={handleCloseIncreamentModal}
                />
            )}
        </>
    )
}

export default IncreamentHistory
