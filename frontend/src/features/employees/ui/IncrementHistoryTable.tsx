import { useEffect, useRef, useState } from "react";
import Box from "../../../shared/Box";
import Button from "../../../shared/Button";
import { useEmployees, IncrementHistory } from "../modal/EmployeesContext";
import IncrementModalForm from "./IncreamentModalForm";
import DeleteModal from "shared/DeleteModal";
import { deleteIncrement } from "../api/employeesApi";

interface IncrementHistoryTableProps {
    employeeCode: string;
    onReload: () => void;
}

const IncrementHistoryTable = ({ employeeCode, onReload }: IncrementHistoryTableProps) => {
    const { employeeIncreamentList, isDeleteModal, setIsDeleteModal } = useEmployees();
    const [updateModal, setUpdateModal] = useState<IncrementHistory | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const deleteModalRef = useRef<HTMLDivElement>(null);

    const updateModalOpen = (incrementData: IncrementHistory) => {
        setUpdateModal(incrementData);
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";
    };

    const updateModalClose = () => {
        setUpdateModal(null);
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto";
    };

    const handleUpdateSuccess = () => {
        updateModalClose();
        onReload();
    };

    const deletingModal = (incrementData: IncrementHistory) => {
        setDeleteError("");
        setIsDeleteModal(incrementData);
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";
    };

    const deleteModalClose = () => {
        setIsDeleteModal(null);
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto";
    };

    const handleDelete = async (increment: IncrementHistory) => {
        try {
            await deleteIncrement(parseInt(increment.increamentId || "0"));
            deleteModalClose();
            onReload();
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setDeleteError(typeof detail === "string" ? detail : "Failed to delete increment");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
                deleteModalClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tableHeadingClassName = "py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter";
    const tableDataClassName = "py-4 px-4 text-sm text-slate-200 font-inter";

    return (
        <>
            <Box boxMainDivClasses="mt-[30px]">
                <div className="w-full overflowXAuto">
                    <table className="w-full min-w-[768px]">
                        <thead className="bg-slate-800/50">
                            <tr className="border-b border-slate-700">
                                <th className={`${tableHeadingClassName} w-[25%]`}>Amount</th>
                                <th className={`${tableHeadingClassName} w-[25%]`}>Effective Date</th>
                                <th className={`${tableHeadingClassName} w-[25%]`}>Notes</th>
                                <th className={`${tableHeadingClassName} w-[25%]`}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeIncreamentList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-inter">
                                        No increment history found
                                    </td>
                                </tr>
                            ) : (
                                employeeIncreamentList.map((data, index) => (
                                    <tr key={index} className="border-t border-slate-800">
                                        <td className={tableDataClassName}>{data.increamentAmount}</td>
                                        <td className={tableDataClassName}>{data.increamentDate}</td>
                                        <td className={tableDataClassName}>{data.notes || "—"}</td>
                                        <td className={tableDataClassName}>
                                            <div className="flex items-center gap-3">
                                                <Button onClick={() => updateModalOpen(data)} buttonClasses="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-inter">
                                                    Update
                                                </Button>
                                                <Button onClick={() => deletingModal(data)} buttonClasses="text-sm px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-inter">
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Box>

            {updateModal && (
                <IncrementModalForm
                    employeeCode={employeeCode}
                    incrementFieldsData={updateModal}
                    onSuccess={handleUpdateSuccess}
                    closeModal={updateModalClose}
                />
            )}

            {isDeleteModal && (
                <DeleteModal ref={deleteModalRef} closeButtonCLick={deleteModalClose}>
                    <h1 className="text-lg text-center font-inter font-semibold text-white border-b border-slate-800 p-5 mb-6">Delete Increment</h1>
                    <div className="flex flex-col gap-3 px-5 mb-5">
                        <p className="text-sm font-inter text-slate-300">
                            Amount: <span className="font-semibold text-white">{isDeleteModal.increamentAmount}</span>
                        </p>
                        <p className="text-sm font-inter text-slate-300">
                            Date: <span className="font-semibold text-white">{isDeleteModal.increamentDate}</span>
                        </p>
                    </div>
                    {deleteError && (
                        <div className="mx-5 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-sm font-inter">{deleteError}</p>
                        </div>
                    )}
                    <div className="border-t border-slate-800 py-4 px-5 flex justify-end gap-3">
                        <button onClick={deleteModalClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white font-inter transition-colors" type="button">
                            Cancel
                        </button>
                        <button onClick={() => handleDelete(isDeleteModal)} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg font-inter transition-colors" type="button">
                            Confirm Delete
                        </button>
                    </div>
                </DeleteModal>
            )}
        </>
    );
};

export default IncrementHistoryTable;
