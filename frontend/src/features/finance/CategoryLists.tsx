import ImageButton from "../../shared/ImageButton"
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom"
import CategoryTable from "./ui/CategoryTable"
import Button from "shared/Button"

const CategoryLists = () => {
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }

    const handleNewCategory = () => {
        navigate("new-category")
    }

    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Create New Finance
            </h2>
            <Button type="button" onClick={handleNewCategory} buttonClasses=" mt-4 bodyBackground px-4 py-6 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
                Add Category
            </Button>
            <CategoryTable />
        </>
    )
}

export default CategoryLists