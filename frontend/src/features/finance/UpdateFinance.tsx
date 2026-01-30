import ImageButton from "../../shared/ImageButton";
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom";
import Form from "./ui/Form"
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useFinance } from "./modal/FinanceContext";

const UpdateFinance = () => {
    const { financeList, editFinanceData, editingFinance, setEditingFinance } = useFinance();

    const { financeId } = useParams()
    console.log(financeId, "ID")
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }
    useEffect(() => {
        if (financeList.length > 0 && editingFinance === null) {
            const foundEmployee = financeList.find((fin) => fin?.FinanceId === financeId);
            console.log(foundEmployee, "Found")
            if (foundEmployee) {
                editFinanceData(foundEmployee);
            }
        }
        return 
    }, [financeList, financeId])
    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Update the Finance
            </h2>
            <Form />
        </>
    )
}

export default UpdateFinance