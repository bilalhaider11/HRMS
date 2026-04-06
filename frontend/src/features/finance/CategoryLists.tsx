import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import CategoryTable from "./ui/CategoryTable"

const CategoryLists = () => {
    const navigate = useNavigate()

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white font-inter">Finance Categories</h1>
                    <p className="text-sm text-slate-400 font-inter mt-1">Manage categories for finance records</p>
                </div>
                <button
                    onClick={() => navigate("new-category")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>
            <CategoryTable />
        </>
    )
}

export default CategoryLists
