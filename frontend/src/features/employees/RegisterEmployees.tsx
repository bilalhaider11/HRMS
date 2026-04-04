import Form from "./ui/Form"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

const RegisterEmployees = () => {
    const navigate = useNavigate()

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
                Register Employee
            </h2>
            <Form />
        </>
    )
}

export default RegisterEmployees
