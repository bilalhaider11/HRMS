import { useRef, useEffect, useState } from "react";
import Modal from "../../../shared/Modal";
import { EmployeeTableData } from "../modal/EmployeesContext";
import { deactivateEmployee } from "../api/employeesApi";

interface StatusModalProps {
    closeModal: () => void;
    employeeStatus: EmployeeTableData;
    onStatusUpdate: (id: string, newStatus: string) => void;
}

const StatusModal = ({ closeModal, onStatusUpdate, employeeStatus }: StatusModalProps) => {
    const [apiError, setApiError] = useState("");
    const [saving, setSaving] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeModal]);

    const isAlreadyInactive = employeeStatus?.status === "Inactive";

    const handleDeactivate = async () => {
        setSaving(true);
        setApiError("");
        try {
            await deactivateEmployee(employeeStatus.id || "");
            onStatusUpdate(employeeStatus.id || "", "Inactive");
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setApiError(typeof detail === "string" ? detail : "Failed to update status");
        }
        setSaving(false);
    };

    return (
        <Modal ref={modalRef} closeButtonCLick={closeModal}>
            <h1 className="text-lg font-semibold text-center text-white font-inter border-b border-slate-700 p-5">
                Update Status
            </h1>
            <div className="px-5 py-6 flex flex-col gap-3">
                <p className="text-sm text-slate-400 font-inter mb-2">
                    Employee: <span className="text-white font-medium">{employeeStatus?.name}</span>
                </p>
                <div className={`w-full px-4 py-3 rounded-xl text-sm font-inter border ${
                    employeeStatus?.status === "Active"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500 bg-amber-500/10 text-amber-400"
                }`}>
                    Current Status: {employeeStatus?.status}
                </div>
                {isAlreadyInactive && (
                    <p className="text-sm text-slate-500 font-inter">This employee is already inactive.</p>
                )}
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
                {!isAlreadyInactive && (
                    <button
                        type="button"
                        onClick={handleDeactivate}
                        disabled={saving}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors"
                    >
                        {saving ? "Saving..." : "Deactivate"}
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default StatusModal;
