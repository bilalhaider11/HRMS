import FormInput from "../../../shared/FormInputs"
import * as Yup from "yup";
import { useFormik } from "formik";
import { FinanceTableData } from "../modal/FinanceContext";
import { useFinance, FinanceCategoriesData, BankAccountData } from "../modal/FinanceContext";
import { createFinanceRecord, updateFinanceRecord } from "../api/financeApi";
import { useCallback, useEffect, useState } from "react";
import SuccessfullModal from "../../../shared/SuccessfullModal";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const formSchema = Yup.object().shape({
    date: Yup.string().required("Date is required"),
    amount: Yup.number().required("Amount is required").positive("Amount must be positive"),
    taxDeductions: Yup.number().min(0, "Tax cannot be negative"),
    chequeNumber: Yup.string(),
    description: Yup.string().required("Description is required"),
    categoryId: Yup.string().required("Category is required"),
    bankAccountId: Yup.string().required("Bank account is required"),
});

interface FormProps {
    onClose?: () => void;
}

const Form = ({ onClose }: FormProps = {}) => {
    const {
        addFinance, successfullModal, setSuccessfullModal, setEditingFinance,
        editingFinance, updateFinance, financeCategoriesList, bankAccountsList,
        selectedBankAccountId,
    } = useFinance();
    const navigate = useNavigate();

    const labelStyles = "block text-sm font-medium text-slate-300 mb-1 font-inter";
    const inputStyles = "text-sm leading-normal px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const errorClasses = "text-red-400 text-xs mt-1 absolute -bottom-5 font-inter";

    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState("Select a category");
    const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
    const [selectedBankName, setSelectedBankName] = useState("Select a bank account");
    const [apiError, setApiError] = useState("");
    const isEditMode = editingFinance !== null;

    const handleSubmit = async (values: any) => {
        setApiError("");
        try {
            const payload = {
                date: values.date,
                description: values.description,
                amount: parseFloat(values.amount),
                tax_deductions: parseFloat(values.taxDeductions?.toString() || "0"),
                cheque_number: values.chequeNumber || undefined,
                category_id: parseInt(values.categoryId),
                bank_account_id: parseInt(values.bankAccountId),
            };

            if (isEditMode) {
                await updateFinanceRecord(parseInt(editingFinance!.FinanceId || "0"), payload);
                updateFinance({ ...editingFinance!, ...payload });
            } else {
                await createFinanceRecord(payload as any);
                addFinance({} as FinanceTableData);
            }
            formik.resetForm();
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setApiError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg).join(", ") : "Failed to save finance record");
        }
    };

    const formik = useFormik({
        initialValues: {
            date: editingFinance?.RawDate ?? "",
            amount: editingFinance?.Amount ?? "",
            chequeNumber: editingFinance?.ChequeNumber ?? "",
            description: editingFinance?.Description ?? "",
            taxDeductions: editingFinance?.TaxDeductions ?? 0,
            categoryId: editingFinance?.CategoryID?.toString() ?? "",
            bankAccountId: editingFinance?.BankAccountId?.toString() ?? selectedBankAccountId,
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    const successfullyAdded = () => {
        setEditingFinance(null);
        setSuccessfullModal(false);
        document.body.style.overflow = "auto";
        if (onClose) {
            onClose();
        } else {
            navigate('/finance');
            window.scrollTo(0, 0);
        }
    };

    // Sync category display name
    useEffect(() => {
        if (financeCategoriesList.length > 0 && formik.values.categoryId) {
            const found = financeCategoriesList.find(c => c.id === formik.values.categoryId);
            setSelectedCategoryName(found?.name || "Select a category");
        }
    }, [editingFinance, financeCategoriesList, formik.values.categoryId]);

    // Sync bank account display name
    useEffect(() => {
        if (bankAccountsList.length > 0 && formik.values.bankAccountId) {
            const found = bankAccountsList.find(a => a.id === formik.values.bankAccountId);
            setSelectedBankName(found?.account_name || "Select a bank account");
        }
    }, [editingFinance, bankAccountsList, formik.values.bankAccountId]);

    const selectingCategory = useCallback((item: FinanceCategoriesData) => {
        setSelectedCategoryName(item.name || "Select a category");
        formik.setFieldValue('categoryId', item.id?.toString() || "");
        setCategoryDropdownOpen(false);
    }, [formik]);

    const selectingBankAccount = useCallback((item: BankAccountData) => {
        setSelectedBankName(item.account_name || "Select a bank account");
        formik.setFieldValue('bankAccountId', item.id?.toString() || "");
        setBankDropdownOpen(false);
    }, [formik]);

    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate className="mt-6 space-y-8">
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Record Details</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Date */}
                        <div className="relative">
                            <FormInput label="Date" name="date" type="date" placeholder="mm/dd/yyyy" value={formik.values.date} onChange={formik.handleChange}
                                labelClassName={labelStyles} inputClassName={`${inputStyles} ${formik.values.date === "" ? "!text-slate-500" : ""}`} />
                            {formik.errors.date && formik.touched.date && <p className={errorClasses}>{formik.errors.date}</p>}
                        </div>

                        {/* Amount */}
                        <div className="relative">
                            <FormInput label="Amount" name="amount" type="number" placeholder="50000" value={formik.values.amount} onChange={formik.handleChange}
                                labelClassName={labelStyles} inputClassName={inputStyles} />
                            {formik.errors.amount && formik.touched.amount && <p className={errorClasses}>{formik.errors.amount}</p>}
                        </div>

                        {/* Tax Deduction */}
                        <div className="relative">
                            <FormInput label="Tax Deduction" name="taxDeductions" type="number" placeholder="0" value={formik.values.taxDeductions} onChange={formik.handleChange}
                                labelClassName={labelStyles} inputClassName={inputStyles} />
                            {formik.errors.taxDeductions && formik.touched.taxDeductions && <p className={errorClasses}>{formik.errors.taxDeductions}</p>}
                        </div>

                        {/* Cheque Number */}
                        <div className="relative">
                            <FormInput label="Cheque Number" name="chequeNumber" type="text" placeholder="CHQ-001 (optional)" value={formik.values.chequeNumber} onChange={formik.handleChange}
                                labelClassName={labelStyles} inputClassName={inputStyles} />
                        </div>

                        {/* Bank Account */}
                        <div className="relative">
                            <label className={labelStyles}>Bank Account</label>
                            <button type="button" onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                                className={`${inputStyles} w-full mt-1.5 flex items-center justify-between cursor-pointer ${selectedBankName === "Select a bank account" ? "!text-slate-500" : ""}`}>
                                {selectedBankName}
                                <ChevronDown className={`w-4 h-4 transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            {bankDropdownOpen && (
                                <div className="absolute top-full mt-1 z-50 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                                    {bankAccountsList.map((item, index) => (
                                        <button key={index} type="button" onClick={() => selectingBankAccount(item)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 font-inter transition-colors border-b border-slate-700 last:border-0">
                                            <div className="font-medium">{item.account_name}</div>
                                            <div className="text-xs text-slate-500">{item.bank_name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {formik.errors.bankAccountId && formik.touched.bankAccountId && <p className={errorClasses}>{formik.errors.bankAccountId}</p>}
                        </div>

                        {/* Category */}
                        <div className="relative">
                            <label className={labelStyles}>Category</label>
                            <button type="button" onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                                className={`${inputStyles} w-full mt-1.5 flex items-center justify-between cursor-pointer ${selectedCategoryName === "Select a category" ? "!text-slate-500" : ""}`}>
                                {selectedCategoryName}
                                <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            {categoryDropdownOpen && (
                                <div className="absolute top-full mt-1 z-50 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                                    {financeCategoriesList.map((item, index) => (
                                        <button key={index} type="button" onClick={() => selectingCategory(item)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 font-inter transition-colors border-b border-slate-700 last:border-0">
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {formik.errors.categoryId && formik.touched.categoryId && <p className={errorClasses}>{formik.errors.categoryId}</p>}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Description</h3>
                    <textarea className={`${inputStyles} w-full h-[120px] mt-1.5 resize-none`}
                        value={formik.values.description} onChange={formik.handleChange} name="description"
                        placeholder="Enter details about this finance record..." />
                    {formik.errors.description && formik.touched.description && (
                        <p className="text-red-400 text-xs mt-1 font-inter">{formik.errors.description}</p>
                    )}
                </div>

                {apiError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-inter">{apiError}</p>
                    </div>
                )}

                <button type="submit" disabled={editingFinance ? !formik.dirty : formik.isSubmitting}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors">
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
