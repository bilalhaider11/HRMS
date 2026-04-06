import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useFinance } from "../modal/FinanceContext";
import { useEffect } from "react";
import CategoryForm from "./CategoryForm";

const UpdateCategory = () => {
    const { financeCategoriesList, editCategoryData, editingCategory, setEditingCategory } = useFinance();
    const navigate = useNavigate()
    const { categoryId } = useParams()

    useEffect(() => {
        if (financeCategoriesList.length > 0 && editingCategory === null) {
            const found = financeCategoriesList.find((cate) => cate?.id === categoryId);
            if (found) {
                editCategoryData(found);
            }
        }
        return () => {
            setEditingCategory(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [financeCategoriesList, categoryId])

    return (
        <>
            <button onClick={() => navigate(-1)} className="mt-5 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-inter text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-semibold text-white font-inter">
                    Update Category
                </h2>
                <CategoryForm />
            </div>
        </>
    )
}

export default UpdateCategory
