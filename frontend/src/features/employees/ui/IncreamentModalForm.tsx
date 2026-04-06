import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import Modal from "../../../shared/Modal";
import { IncrementHistory } from "../modal/EmployeesContext";
import { createIncrement, updateIncrement } from "../api/employeesApi";

interface IncrementModalFormProps {
    closeModal?: () => void;
    employeeCode?: string;
    incrementFieldsData?: IncrementHistory;
    onSuccess?: () => void;
}

const formSchema = Yup.object().shape({
    increamentAmount: Yup.number().required("Increment Amount is required").positive("Must be positive"),
    increamentDate: Yup.string().required("Increment Date is required"),
});

const IncrementModalForm = ({ closeModal, employeeCode, incrementFieldsData, onSuccess }: IncrementModalFormProps) => {
    const isEditMode = !!incrementFieldsData;
    const [apiError, setApiError] = useState("");

    const labelStyles = "block text-sm font-medium text-slate-300 mb-1 font-inter";
    const inputStyles = "w-full text-sm leading-normal px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none";
    const errorClasses = "text-red-400 text-xs mt-1 absolute -bottom-5 font-inter";

    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal && closeModal();
            }
        };
        if (closeModal) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeModal]);

    const handleSubmit = async (values: any) => {
        setApiError("");
        try {
            if (isEditMode) {
                await updateIncrement(parseInt(incrementFieldsData!.increamentId || "0"), {
                    increment_amount: parseFloat(values.increamentAmount),
                    effective_date: values.increamentDate,
                    notes: values.notes || "",
                });
            } else {
                await createIncrement({
                    employee_code: employeeCode || "",
                    increment_amount: parseFloat(values.increamentAmount),
                    effective_date: values.increamentDate,
                    notes: values.notes || "",
                });
            }
            onSuccess && onSuccess();
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setApiError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg).join(", ") : "Failed to save increment");
        }
    };

    const formik = useFormik({
        initialValues: {
            increamentAmount: incrementFieldsData?.increamentAmount ?? "",
            increamentDate: incrementFieldsData?.increamentDate ?? "",
            notes: incrementFieldsData?.notes ?? "",
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    return (
        <Modal ref={modalRef} closeButtonCLick={closeModal}>
            <h1 className="text-lg font-semibold text-center text-white font-inter border-b border-slate-700 p-5">
                {isEditMode ? "Update" : "Add"} Increment
            </h1>
            <form onSubmit={formik.handleSubmit} noValidate>
                <div className="px-5 py-6 flex flex-col gap-5">
                    <div className="relative">
                        <label className={labelStyles}>Increment Amount</label>
                        <input type="number" name="increamentAmount" placeholder="5000" value={formik.values.increamentAmount} onChange={formik.handleChange} className={inputStyles} />
                        {formik.errors.increamentAmount && formik.touched.increamentAmount && (
                            <p className={errorClasses}>{formik.errors.increamentAmount}</p>
                        )}
                    </div>
                    <div className="relative">
                        <label className={labelStyles}>Effective Date</label>
                        <input type="date" name="increamentDate" value={formik.values.increamentDate} onChange={formik.handleChange} className={inputStyles} />
                        {formik.errors.increamentDate && formik.touched.increamentDate && (
                            <p className={errorClasses}>{formik.errors.increamentDate}</p>
                        )}
                    </div>
                    <div>
                        <label className={labelStyles}>Notes (optional)</label>
                        <textarea name="notes" value={formik.values.notes} onChange={formik.handleChange} placeholder="Reason for increment..." className={`${inputStyles} h-20 resize-none`} />
                    </div>
                </div>

                {apiError && (
                    <div className="mx-5 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-inter">{apiError}</p>
                    </div>
                )}

                <div className="border-t border-slate-700 py-4 px-5 flex justify-end gap-3">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-slate-400 hover:text-white font-inter transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={formik.isSubmitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium font-inter rounded-xl transition-colors">
                        {formik.isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default IncrementModalForm;
