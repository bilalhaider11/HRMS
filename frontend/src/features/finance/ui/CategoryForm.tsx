import FormInput from "../../../shared/FormInputs"
import * as Yup from "yup";
import { useFormik } from "formik";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useFinance, FinanceCategoriesData } from "../modal/FinanceContext";
import Button from "shared/Button";
import SuccessfullModal from "shared/SuccessfullModal";
import { useNavigate } from "react-router-dom";

const formSchema = Yup.object().shape({
    categoryName: Yup.string().required("Name is required"),
    colorCode: Yup.string().required("Color Code is required"),

});
const CategoryForm = () => {
    const { addCategory, clearError, idExistError, successfullModal, setSuccessfullModal, setEditingCategory, editingCategory, updateFinanceCategory, financeCategoriesList } = useFinance();
    const labelStyles = "font-urbanist font-semibold text-base md:text-lg lg:text-[21px] lg:leading-[180%] text-white"
    const inputBorder = "inputMainBorder mt-3.5 w-full rounded-[8px]"
    const inputStyles = "inputBox text-sm md:text-base leading-normal px-4 py-2.5 lg:py-[21px] lg:px-[29px] rounded-[15px] text-white placeholder-[#747681]"
    const errorClasses = "text-red-500 text-xs mt-1 absolute -bottom-6"

    const navigate = useNavigate()

    const [generatedCategoryId] = useState<string>(uuidv4())

    const handleSubmit = (values: any) => {
        if (editingCategory !== null && updateFinanceCategory) {
            const updatedCategory = {
                ...editingCategory,
                ...values,
            };
            updateFinanceCategory(updatedCategory);
            formik.resetForm();
        } else {
            const newCategory: FinanceCategoriesData = {
                id: values.id,
                name: values.categoryName,
                colorCode: values.colorCode,
                companyId: values.companyId
            }
            const added = addCategory(newCategory);
            console.log(added)
            if (added) {
                formik.resetForm();
            }
        }
    }
    const successfullyAdded = () => {
        setEditingCategory(null)
        setSuccessfullModal(false)
        navigate('/finance/category-lists')
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    const formik = useFormik({
        initialValues: {
            id: editingCategory?.id || generatedCategoryId,
            categoryName: editingCategory?.name || "",
            colorCode: editingCategory?.colorCode || "",
            companyId: editingCategory?.companyId || 101,
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate>
                <div className="grid md:grid-cols-2 gap-3 md:gap-5 lg:gap-[38px]">
                    <div className="relative">
                        <FormInput label="Id"
                            type="text"
                            id="id"
                            name="id"
                            value={formik.values.id}
                            onChange={(e) => {
                                formik.handleChange(e);
                                clearError();
                            }}
                            readOnly
                            placeholder="Category ID" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                    </div>
                    <div className="relative">
                        <FormInput label="Category Name" name="categoryName" type="text" placeholder="Category Name.." value={formik.values.categoryName} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.categoryName && formik.touched.categoryName && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.categoryName}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Color Code" name="colorCode" type="text" placeholder="Blue, Green etc.." value={formik.values.colorCode} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.colorCode && formik.touched.colorCode && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.colorCode}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Company Id"
                            type="number"
                            id="companyId"
                            name="companyId"
                            value={formik.values.companyId}
                            onChange={(e) => {
                                formik.handleChange(e);
                                clearError();
                            }}
                            readOnly
                            placeholder="Company ID" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                    </div>
                </div>

                <Button type="submit" disabled={editingCategory ? !formik.dirty : false} buttonClasses={`min-h-10 lg:min-h-[64px] border border-[#CDD6D7] border-solid bg-[#283573] py-3 px-2 lg:py-5 lg:px-[75px] rounded-[15px] flex mx-auto lg:mx-0 mt-4 md:mt-[58px] text-base md:text-lg lg:text-2xl font-semibold lg:leading-[160%] font-urbanist text-white min-w-[200px] lg:min-w-auto w-fit ${editingCategory && !formik.dirty ? 'opacity-50 !cursor-not-allowed' : 'opacity-1 !cursor-pointer'}`}>
                    {editingCategory ? 'Update' : 'Register'}
                </Button>
            </form>
            {successfullModal &&
                <SuccessfullModal modalClassName="" modalMain="" successfullOk={successfullyAdded}>
                    Successfully Added Your Category
                </SuccessfullModal>
            }
        </>
    )
}

export default CategoryForm
