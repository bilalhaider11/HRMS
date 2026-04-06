import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus } from "lucide-react"
import ItemsTable from "./ui/ItemsTable"

const Items = () => {
    const navigate = useNavigate()

    return (
        <>
            <button onClick={() => navigate(-1)} className="mt-5 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-inter text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <div className="mt-6 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-semibold text-white font-inter">
                    Items
                </h2>
                <button
                    onClick={() => navigate("/inventory/new-items")}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New Item
                </button>
            </div>
            <ItemsTable />
        </>
    )
}

export default Items
