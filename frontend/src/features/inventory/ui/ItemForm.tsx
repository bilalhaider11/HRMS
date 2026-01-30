import Button from "shared/Button";
import FormInput from "../../../shared/FormInputs"
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { useFormik } from "formik";
import { ItemsTableData, useInventory } from "../modal/InventoryContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessfullModal from "shared/SuccessfullModal";


const formSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is Required"),
    quantity: Yup.number().required("Quantity is required"),
    categoryId: Yup.number().required("Category Id is Required"),
    storeId: Yup.number().required("Store Id is required")
});

const ItemForm = () => {
    const navigate = useNavigate()
    const { addItem, clearError, idExistError, successfullModal, setSuccessfullModal, setEditingItems, editingItems, updateItem, itemsList } = useInventory();

    const labelStyles = "font-urbanist font-semibold text-base md:text-lg lg:text-[21px] lg:leading-[180%] text-white"
    const inputBorder = "inputMainBorder mt-3.5 w-full rounded-[8px]"
    const inputStyles = "inputBox text-sm md:text-base leading-normal px-4 py-2.5 lg:py-[21px] lg:px-[29px] rounded-[15px] text-white placeholder-[#747681]"
    const errorClasses = "text-red-500 text-xs mt-1 absolute -bottom-6"

    const [generatedItemId] = useState<string>(uuidv4());
    const handleSubmit = (values: any) => {
        console.log(editingItems)
        if (editingItems !== null && updateItem) {
            const updatedStore = {
                ...editingItems,
                ...values,
            };
            updateItem(updatedStore);
            formik.resetForm();
        } else {
            const newStore: ItemsTableData = {
                itemId: values.storeId,
                itemName: values.name,
                itemDescription: values.description,
                storeId: values.storeId,
                categoryId: values.categoryId,
                itemQuantity: values.quantity       
            }
            const added = addItem(newStore);
            console.log(added)
            if (added) {
                formik.resetForm();
            }
        }
    }

    const formik = useFormik({
        initialValues: {
            itemId: editingItems?.itemId || generatedItemId,
            name: editingItems?.itemName,
            description: editingItems?.itemDescription,
            storeId: editingItems?.storeId,
            categoryId: editingItems?.categoryId,
            quantity: editingItems?.itemQuantity
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });
    const successfullyAdded = () => {
        setEditingItems(null)
        setSuccessfullModal(false)
        navigate('/inventory/stores')
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    console.log(editingItems, "editing")

    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate>
                <div className="grid md:grid-cols-2 gap-3 md:gap-5 lg:gap-[38px]">
                    <div className="relative">
                        <FormInput label="Id"
                            type="text"
                            id="itemId"
                            name="itemId"
                            value={formik.values.itemId}
                            onChange={(e) => {
                                formik.handleChange(e);
                                clearError();
                            }}
                            readOnly
                            placeholder="Store ID" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                      

                    </div>
                    <div className="relative">
                        <FormInput label="Name" name="name" type="text" placeholder="Name" value={formik.values.name} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.name && formik.touched.name && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Category Id" name="categoryId" type="number" value={formik.values.categoryId} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                          {formik.errors.categoryId && formik.touched.categoryId && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.categoryId}
                            </p>
                        )}
                    </div>
                      <div className="relative">
                        <FormInput label="Store Id" name="storeId" type="number" value={formik.values.storeId} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                            {formik.errors.storeId && formik.touched.storeId && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.storeId}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Quantity" name="quantity" type="number" value={formik.values.quantity} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                            {formik.errors.quantity && formik.touched.quantity && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.quantity}
                            </p>
                        )}
                    </div>
                      <div className="relative">
                        <label className={`${labelStyles}`}>Description</label>
                        <div className={`${inputBorder} h-[76%]`}>
                            <textarea
                                className={`${inputStyles} w-full h-[181px] outline-none`}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                name="description"
                            />
                        </div>
                        {formik.errors.description && formik.touched.description && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.description}
                            </p>
                        )}
                    </div>
                </div>

                <Button type="submit" disabled={editingItems ? !formik.dirty : false} buttonClasses={`min-h-10 lg:min-h-[64px] border border-[#CDD6D7] border-solid bg-[#283573] py-3 px-2 lg:py-5 lg:px-[75px] rounded-[15px] flex mx-auto lg:mx-0 mt-4 md:mt-[58px] text-base md:text-lg lg:text-2xl font-semibold lg:leading-[160%] font-urbanist text-white min-w-[200px] lg:min-w-auto w-fit ${editingItems && !formik.dirty ? 'opacity-50 !cursor-not-allowed' : 'opacity-1 !cursor-pointer'}`}>
                    {editingItems ? 'Update' : 'Register'}
                </Button>
            </form>
            {successfullModal &&
                <SuccessfullModal modalClassName="" modalMain="" successfullOk={successfullyAdded}>
                    {editingItems ? 'Successfully Updated your Category.' : 'Successfully Registered your Category.'}
                </SuccessfullModal>
            }
        </>
    )
}
export default ItemForm