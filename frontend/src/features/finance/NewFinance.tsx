import { useNavigate } from "react-router-dom"
import backImg from "../../assets/images/back.svg"
import ImageButton from "../../shared/ImageButton"
import Form from "./ui/Form"

const NewFinance = () => {
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }


    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
               Create New Finance
            </h2>
            <Form />
        </>
    )
}

export default NewFinance