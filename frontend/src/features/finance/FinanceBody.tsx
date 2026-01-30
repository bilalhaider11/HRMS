import Button from "../../shared/Button"
import registerIcon from "../../assets/images/register.svg"
import FinanceTable from "./ui/FinanceTable"
import { useNavigate } from "react-router-dom"

const FinanceBody = () => {
    const navigate = useNavigate()

    const newFinance = () => {
        navigate("new-finance")
    }
    const allCategoryLists = () => {
        navigate("category-lists")
    }
    return (
        <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Button onClick={newFinance} type="button" buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                    <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                        <img src={registerIcon} alt="date" className="w-full h-full" />
                    </div>
                    Add New Finance
                </Button>
                <Button onClick={allCategoryLists} type="button" buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                    Category Lists

                </Button>
            </div>
            <FinanceTable />
        </>
    )
}

export default FinanceBody