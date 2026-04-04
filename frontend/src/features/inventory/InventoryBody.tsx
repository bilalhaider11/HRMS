import { useNavigate } from "react-router-dom"
import { FolderOpen, Package } from "lucide-react"

const InventoryBody = () => {
    const navigate = useNavigate()
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white font-inter">Inventory</h1>
                <p className="text-sm text-slate-400 font-inter mt-1">Manage item categories and inventory stock</p>
            </div>

            <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate("categories")} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium font-inter rounded-xl transition-colors">
                    <FolderOpen className="w-4 h-4" />
                    Categories
                </button>
                <button type="button" onClick={() => navigate("items")} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium font-inter rounded-xl transition-colors">
                    <Package className="w-4 h-4" />
                    Items
                </button>
            </div>
        </div>
    )
}

export default InventoryBody
