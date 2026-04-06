import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useFinance } from "./modal/FinanceContext";
import { ArrowLeft } from "lucide-react";
import Form from "./ui/Form";

const UpdateFinance = () => {
    const { financeList, editFinanceData, editingFinance } = useFinance();
    const { financeId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (financeList.length > 0 && editingFinance === null && financeId) {
            const found = financeList.find((fin) => fin?.FinanceId === financeId);
            if (found) {
                editFinanceData(found);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [financeList, financeId]);

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
                Update Finance Record
            </h2>
            <Form />
        </>
    );
};

export default UpdateFinance;
