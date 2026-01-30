import { useNavigate, useParams } from "react-router-dom"
import ImageButton from "../../../shared/ImageButton"
import backImg from "../../../assets/images/back.svg"
import { useFinance } from "../modal/FinanceContext";
import { useEffect } from "react";
import CategoryForm from "./CategoryForm";

const UpdateCategory = () => {
    const { financeCategoriesList, editCategoryData, editingCategory, setEditingCategory } = useFinance();
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }
    const { categoryId } = useParams()
    useEffect(() => {
        if (financeCategoriesList.length > 0 && editingCategory === null) {
            const foundEmployee = financeCategoriesList.find((cate) => cate?.id === categoryId);
            console.log(foundEmployee, "Found")
            if (foundEmployee) {
                editCategoryData(foundEmployee);
            }
        }
        return () => {
            setEditingCategory(null);
        };
    }, [financeCategoriesList, categoryId])
    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Update the Category
            </h2>
            <CategoryForm />
        </>
    )
}

export default UpdateCategory