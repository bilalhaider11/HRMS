import ImageButton from "../../shared/ImageButton";
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useInventory } from "./modal/InventoryContext";
import CategoryForm from "./ui/CategoryForm";

const UpdateCategory = () => {
    const { categoryList, editCategoryData, editingCategory, setEditingCategory } = useInventory();

    const { categoryId } = useParams()
    console.log(categoryId, "ID")
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }
    useEffect(() => {
        if (categoryList.length > 0 && editingCategory === null && categoryId) {
            const foundCategory = categoryList.find((category) => category.categoryId === parseInt(categoryId));
            console.log(foundCategory, "Found")
            if (foundCategory) {
                editCategoryData(foundCategory);
            }
        }
        return 
    }, [categoryList, categoryId])
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