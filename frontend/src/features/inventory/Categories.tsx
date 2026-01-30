import ImageButton from "../../shared/ImageButton"
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom"

import registerIcon from "../../assets/images/register.svg"
import Button from "shared/Button"
import CategoryTable from "./ui/CategoryTable"


const Categories = () => {
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }

    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <div className="mt-5 md:mt-[46px] flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                    Categories
                </h2>
                <Button onClick={() => navigate("/inventory/new-category")} type="button" buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                    <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                        <img src={registerIcon} alt="date" className="w-full h-full" />
                    </div>
                    Add New Category
                </Button>

            </div>
            <CategoryTable />
        </>
    )
}

export default Categories