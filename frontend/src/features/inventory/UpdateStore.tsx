import ImageButton from "../../shared/ImageButton";
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useInventory } from "./modal/InventoryContext";
import Form from "./ui/Form";

const UpdateStore = () => {
    const { storeList, editStoreData, editingStore, setEditingStore } = useInventory();

    const { storeId } = useParams()
    console.log(storeId, "ID")
    const navigate = useNavigate()

    const backPgae = () => {
        navigate(-1)
    }
    useEffect(() => {
        if (storeList.length > 0 && editingStore === null && storeId) {
            const foundStore = storeList.find((store) => store?.id === parseInt(storeId));
            console.log(foundStore, "Found")
            if (foundStore) {
                editStoreData(foundStore);
            }
        }
        return 
    }, [storeList, storeId])
    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Update the Store
            </h2>
            <Form />
        </>
    )
}

export default UpdateStore