import { useNavigate } from "react-router-dom"
import Form from "./ui/Form"
import { ArrowLeft } from "lucide-react"
import { useFinance } from "./modal/FinanceContext"
import { useEffect } from "react"

const NewFinance = () => {
    const navigate = useNavigate()
    const { setEditingFinance } = useFinance()

    useEffect(() => {
        setEditingFinance(null);
    }, [setEditingFinance]);

    return (
        <>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white font-inter transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <h2 className="mt-4 text-2xl font-semibold font-inter text-white">
                Add Finance Record
            </h2>
            <Form />
        </>
    )
}

export default NewFinance
