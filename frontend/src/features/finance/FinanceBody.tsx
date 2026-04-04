import FinanceTable from "./ui/FinanceTable"
import { useNavigate } from "react-router-dom"
import { Plus, List } from "lucide-react"

const FinanceBody = () => {
    const navigate = useNavigate()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white font-inter">Finance</h1>
                <p className="text-sm text-slate-400 font-inter mt-1">Track financial transactions, salaries, and expenses</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate("new-finance")} type="button" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors">
                    <Plus className="w-4 h-4" />
                    New Record
                </button>
                <button onClick={() => navigate("category-lists")} type="button" className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium font-inter rounded-xl transition-colors">
                    <List className="w-4 h-4" />
                    Categories
                </button>
            </div>

            <FinanceTable />
        </div>
    )
}

export default FinanceBody
