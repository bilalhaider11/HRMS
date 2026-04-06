import FormInput from "../../../shared/FormInputs"
import * as Yup from "yup";
import { useFormik } from "formik";
import { FinanceTableData } from "../modal/FinanceContext";
import { useFinance, FinanceCategoriesData } from "../modal/FinanceContext";
import { createFinanceRecord, updateFinanceRecord } from "../api/financeApi";
import { useCallback, useEffect, useState } from "react";
import SuccessfullModal from "../../../shared/SuccessfullModal";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const formSchema = Yup.object().shape({
    date: Yup.string().required("Date is required"),
    amount: Yup.number().required("Amount is required").positive("Amount must be positive"),
    taxDeductions: Yup.number().min(0, "Tax cannot be negative"),
    chequeNumber: Yup.string().required("Cheque Number is required"),
    description: Yup.string().required("Description is required"),
    categoryId: Yup.string().required("Category is required")
});

const Form = () => {
    const { addFinance, successfullModal, setSuccessfullModal, setEditingFinance, editingFinance, updateFinance, financeCategoriesList } = useFinance();
    const navigate = useNavigate();

    const labelStyles = "block text-sm font-medium text-slate-300 mb-1 font-inter";
    const inputStyles = "text-sm leading-normal px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const errorClasses = "text-red-400 text-xs mt-1 absolute -bottom-5 font-inter";

    const [selectTheCategory, setSelectTheCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Select a category");
    const [categoryId, setCategoryId] = useState("");
    const [apiError, setApiError] = useState("");
    const [isEditMode] = useState(editingFinance !== null);

    const handleSubmit = async (values: any) => {
        setApiError("");
        try {
            if (editingFinance !== null && updateFinance) {
                await updateFinanceRecord(parseInt(editingFinance.FinanceId || "0"), {
                    date: values.date || undefined,
                    description: values.description || undefined,
                    amount: parseFloat(values.amount) || undefined,
                    tax_deductions: parseFloat(formik.values.taxDeductions?.toString() || "0") || undefined,
                    cheque_number: values.chequeNumber || undefined,
                    category_id: parseInt(values.categoryId || categoryId) || undefined,
                });
                updateFinance({
                    ...editingFinance,
                    Date: values.date,
                    Amount: parseFloat(values.amount?.toString()) || 0,
                    TaxDeductions: parseFloat(formik.values.taxDeductions?.toString() || "0"),
                    ChequeNumber: values.chequeNumber,
                    Description: values.description,
                    CategoryID: parseInt(values.categoryId || categoryId),
                });
                formik.resetForm();
            } else {
                await createFinanceRecord({
                    date: values.date,
                    description: values.description,
                    amount: parseFloat(values.amount) || 0,
                    tax_deductions: parseFloat(formik.values.taxDeductions?.toString() || "0"),
                    cheque_number: values.chequeNumber,
                    category_id: parseInt(values.categoryId || categoryId) || 0,
                });
                const newFinance: FinanceTableData = {
                    Date: values.date,
                    Amount: parseFloat(values.amount) || 0,
                    ChequeNumber: values.chequeNumber,
                    TaxDeductions: parseFloat(formik.values.taxDeductions?.toString() || "0"),
                    Description: values.description,
                    CategoryID: parseInt(values.categoryId || categoryId) || undefined,
                };
                addFinance(newFinance);
                formik.resetForm();
            }
        } catch (err: any) {
            setApiError(err.response?.data?.detail || "Failed to save finance record");
        }
    };

    const formik = useFormik({
        initialValues: {
            date: editingFinance?.Date || "",
            amount: editingFinance?.Amount || "",
            chequeNumber: editingFinance?.ChequeNumber || "",
            description: editingFinance?.Description || "",
            taxDeductions: editingFinance?.TaxDeductions || "",
            categoryId: editingFinance?.CategoryID?.toString() || "",
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    const successfullyAdded = () => {
        setEditingFinance(null);
        setSuccessfullModal(false);
        navigate('/finance');
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto";
    };

    const selectCategory = useCallback(() => {
        setSelectTheCategory(!selectTheCategory);
    }, [selectTheCategory]);

    useEffect(() => {
        if (financeCategoriesList.length > 0) {
            const foundCategorySelected = financeCategoriesList.find((fin) => fin.id?.toString() === editingFinance?.CategoryID?.toString());
            if (foundCategorySelected) {
                setCategoryId(foundCategorySelected.id?.toString() || "");
                setSelectedCategory(foundCategorySelected.name || "Select a category");
            }
        }
    }, [editingFinance, financeCategoriesList]);

    const selectingTheCategory = (item: FinanceCategoriesData) => {
        setSelectedCategory(item.name || selectedCategory);
        setCategoryId(item.id?.toString() || "");
        formik.setFieldValue('categoryId', item.id?.toString() || "");
        setSelectTheCategory(false);
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate className="mt-6 space-y-8">
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Record Details</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative">
                            <FormInput label="Date" name="date" type="date" placeholder="mm/dd/yyyy" value={formik.values.date} onChange={formik.handleChange} labelClassName={labelStyles} inputClassName={`${inputStyles} ${formik.values.date === "" ? "!text-slate-500" : ""}`} />
                            {formik.errors.date && formik.touched.date && (
                                <p className={errorClasses}>{formik.errors.date}</p>
                            )}
                        </div>
                        <div className="relative">
                            <FormInput label="Amount" name="amount" type="number" placeholder="50000" value={formik.values.amount} onChange={formik.handleChange} labelClassName={labelStyles} inputClassName={inputStyles} />
                            {formik.errors.amount && formik.touched.amount && (
                                <p className={errorClasses}>{formik.errors.amount}</p>
                            )}
                        </div>
                        <div className="relative">
                            <FormInput label="Tax Deduction" name="taxDeductions" type="number" placeholder="0" value={formik.values.taxDeductions} onChange={formik.handleChange} labelClassName={labelStyles} inputClassName={inputStyles} />
                            {formik.errors.taxDeductions && formik.touched.taxDeductions && (
                                <p className={errorClasses}>{formik.errors.taxDeductions}</p>
                            )}
                        </div>
                        <div className="relative">
                            <FormInput label="Cheque Number" name="chequeNumber" type="text" placeholder="CHQ-001" value={formik.values.chequeNumber} onChange={formik.handleChange} labelClassName={labelStyles} inputClassName={inputStyles} />
                            {formik.errors.chequeNumber && formik.touched.chequeNumber && (
                                <p className={errorClasses}>{formik.errors.chequeNumber}</p>
                            )}
                        </div>
                        <div className="relative">
                            <label className={labelStyles}>Category</label>
                            <button
                                type="button"
                                onClick={selectCategory}
                                className={`${inputStyles} w-full mt-1.5 flex items-center justify-between cursor-pointer ${selectedCategory === "Select a category" ? "!text-slate-500" : ""}`}
                            >
                                {selectedCategory}
                                <ChevronDown className={`w-4 h-4 transition-transform ${selectTheCategory ? "rotate-180" : ""}`} />
                            </button>
                            {selectTheCategory && (
                                <div className="absolute top-full mt-1 z-50 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                                    {financeCategoriesList.map((item, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => selectingTheCategory(item)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 font-inter transition-colors border-b border-slate-700 last:border-0"
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {formik.errors.categoryId && formik.touched.categoryId && (
                                <p className={errorClasses}>{formik.errors.categoryId}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Description</h3>
                    <textarea
                        className={`${inputStyles} w-full h-[120px] mt-1.5 resize-none`}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        name="description"
                        placeholder="Enter details about this finance record..."
                    />
                    {formik.errors.description && formik.touched.description && (
                        <p className="text-red-400 text-xs mt-1 font-inter">{formik.errors.description}</p>
                    )}
                </div>

                {apiError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-inter">{apiError}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={editingFinance ? !formik.dirty : formik.isSubmitting}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors"
                >
                    {formik.isSubmitting ? 'Saving...' : isEditMode ? 'Update Record' : 'Add Record'}
                </button>
            </form>

            {successfullModal && (
                <SuccessfullModal modalClassName="" modalMain="" successfullOk={successfullyAdded}>
                    {isEditMode ? 'Finance record updated successfully.' : 'Finance record added successfully.'}
                </SuccessfullModal>
            )}
        </>
    );
};

export default Form;
