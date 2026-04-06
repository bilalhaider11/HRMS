import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import CategoryForm from "./ui/CategoryForm"
import { useFinance } from "./modal/FinanceContext"
import { useEffect } from "react"

const NewCategory = () => {
    const navigate = useNavigate()
    const { setEditingCategory } = useFinance()

    useEffect(() => {
        setEditingCategory(null);
    }, [setEditingCategory]);

    return (
        <>
            <button onClick={() => navigate(-1)} className="mt-5 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-inter text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-semibold text-white font-inter">
                    Create New Category
                </h2>
                <CategoryForm />
            </div>
        </>
    )
}

export default NewCategory
