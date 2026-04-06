import FormInput from "../../../shared/FormInputs"
import * as Yup from "yup";
import { useFormik } from "formik";
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
    const { addCategory, successfullModal, setSuccessfullModal, setEditingCategory, editingCategory, updateFinanceCategory: updateFinanceCategoryCtx } = useFinance();
    const navigate = useNavigate();

    const labelStyles = "block text-sm font-medium text-slate-300 mb-1 font-inter";
    const inputStyles = "text-sm leading-normal px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const errorClasses = "text-red-400 text-xs mt-1 absolute -bottom-5 font-inter";

    const [apiError, setApiError] = useState("");
    const isEditMode = editingCategory !== null;

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
            const detail = err.response?.data?.detail;
            setApiError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg).join(", ") : "Failed to save category");
        }
    };

    const successfullyAdded = () => {
        setEditingCategory(null);
        setSuccessfullModal(false);
        navigate('/finance/category-lists');
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto";
    };

    const formik = useFormik({
        initialValues: {
            categoryName: editingCategory?.name || "",
            colorCode: editingCategory?.colorCode || "#3B82F6",
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate className="mt-6 space-y-8">
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Category Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FormInput label="Category Name" name="categoryName" type="text" placeholder="e.g. Salaries" value={formik.values.categoryName} onChange={formik.handleChange} labelClassName={labelStyles} inputClassName={inputStyles} />
                            {formik.errors.categoryName && formik.touched.categoryName && (
                                <p className={errorClasses}>{formik.errors.categoryName}</p>
                            )}
                        </div>
                        <div className="relative">
                            <label className={labelStyles}>Color Code</label>
                            <div className="flex items-center gap-3 mt-1.5">
                                <input
                                    type="color"
                                    name="colorCode"
                                    value={formik.values.colorCode}
                                    onChange={formik.handleChange}
                                    className="w-12 h-12 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-1"
                                />
                                <input
                                    type="text"
                                    name="colorCode"
                                    value={formik.values.colorCode}
                                    onChange={formik.handleChange}
                                    placeholder="#3B82F6"
                                    className={`${inputStyles} flex-1`}
                                />
                            </div>
                            {formik.errors.colorCode && formik.touched.colorCode && (
                                <p className={errorClasses}>{formik.errors.colorCode}</p>
                            )}
                        </div>
                    </div>
                </div>

                {apiError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-inter">{apiError}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={editingCategory ? !formik.dirty : formik.isSubmitting}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors"
                >
                    {formik.isSubmitting ? 'Saving...' : isEditMode ? 'Update Category' : 'Add Category'}
                </button>
            </form>

            {successfullModal && (
                <SuccessfullModal modalClassName="" modalMain="" successfullOk={successfullyAdded}>
                    {isEditMode ? 'Category updated successfully.' : 'Category added successfully.'}
                </SuccessfullModal>
            )}
        </>
    );
};

export default CategoryForm;
