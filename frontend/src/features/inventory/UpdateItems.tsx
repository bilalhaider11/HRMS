import ImageButton from "../../shared/ImageButton";
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useInventory } from "./modal/InventoryContext";
import ItemForm from "./ui/ItemForm";

const UpdateItems = () => {
    const { itemsList, editItemData, editingItems, setEditingItems } = useInventory();

    const { itemId } = useParams()
    console.log(itemId, "ID")
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }
    useEffect(() => {
        if (itemsList.length > 0 && editingItems === null && itemId) {
            const foundItem = itemsList.find((item) => item.itemId === parseInt(itemId));
            console.log(foundItem, "Found")
            if (foundItem) {
                editItemData(foundItem);
            }
        }
        return 
    }, [itemsList, itemId])
    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Update the Item
            </h2>
            <ItemForm />
        </>
    )
}

export default UpdateItems