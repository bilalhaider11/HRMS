import Button from "../../shared/Button"
import storeIcon from "../../assets/images/store.svg"
import categoryIcon from "../../assets/images/departments.svg"
import itemsIcon from "../../assets/images/itemsIcon.svg"
import { useNavigate } from "react-router-dom"

const InventoryBody = () => {
    const navigate = useNavigate()
    return (
        <div className="flex gap-5">
            <Button onClick={() => navigate("stores")} type="button" buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                    <img src={storeIcon} alt="date" className="w-full h-full" />
                </div>
                Stores
            </Button>
            <Button type="button" onClick={() => navigate("categories")} buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                    <img src={categoryIcon} alt="icon" className="w-full h-full" />
                </div>
                Categories
             </Button>
                  <Button type="button" onClick={() => navigate("items")} buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                    <img src={itemsIcon} alt="icon" className="w-full h-full" />
                </div>
                Items
            </Button>
        </div>
    )
}

export default InventoryBody