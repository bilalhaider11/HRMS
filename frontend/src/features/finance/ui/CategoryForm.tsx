import FormInput from "../../../shared/FormInputs"
import * as Yup from "yup";
import { useFormik } from "formik";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useFinance, FinanceCategoriesData } from "../modal/FinanceContext";
import SuccessfullModal from "shared/SuccessfullModal";
import { useNavigate } from "react-router-dom";
import { createFinanceCategory, updateFinanceCategory } from "../api/financeApi";

const formSchema = Yup.object().shape({
    categoryName: Yup.string().required("Name is required"),
    colorCode: Yup.string().required("Color Code is required"),

});
const CategoryForm = () => {
    const { addCategory, clearError, successfullModal, setSuccessfullModal, setEditingCategory, editingCategory, updateFinanceCategory: updateFinanceCategoryCtx } = useFinance();
    const labelStyles = "font-urbanist font-semibold text-base md:text-lg lg:text-[21px] lg:leading-[180%] text-white"
    const inputBorder = "inputMainBorder mt-3.5 w-full rounded-[8px]"
    const inputStyles = "inputBox text-sm md:text-base leading-normal px-4 py-2.5 lg:py-[21px] lg:px-[29px] rounded-[15px] text-white placeholder-[#747681]"
    const errorClasses = "text-red-500 text-xs mt-1 absolute -bottom-6"

    const navigate = useNavigate()

    const [generatedCategoryId] = useState<string>(uuidv4())

    const [apiError, setApiError] = useState("");

    const handleSubmit = async (values: any) => {
        setApiError("");
        try {
            if (editingCategory !== null && updateFinanceCategoryCtx) {
                await updateFinanceCategory(parseInt(editingCategory.id || "0"), values.categoryName, values.colorCode);
                updateFinanceCategoryCtx({ ...editingCategory, name: values.categoryName, colorCode: values.colorCode });
                formik.resetForm();
            } else {
                const result = await createFinanceCategory(values.categoryName, values.colorCode);
                const newCategory: FinanceCategoriesData = {
                    id: String(result.category_id),
                    name: result.category_name,
                    colorCode: result.color_code,
                };
                addCategory(newCategory);
                formik.resetForm();
            }
        } catch (err: any) {
            setApiError(err.response?.data?.detail || "Failed to save category");
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
                </div>

                {apiError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-inter">{apiError}</p>
                    </div>
                )}
                <button type="submit" disabled={editingCategory ? !formik.dirty : formik.isSubmitting} className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors">
                    {formik.isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                </button>
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
