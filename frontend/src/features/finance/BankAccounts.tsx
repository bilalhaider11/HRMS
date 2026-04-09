import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Landmark } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useFinance, BankAccountData } from "./modal/FinanceContext";
import { createBankAccount, updateBankAccount, deleteBankAccount } from "./api/financeApi";

const bankSchema = Yup.object().shape({
    account_name: Yup.string().required("Account name is required"),
    bank_name: Yup.string().required("Bank name is required"),
    account_number: Yup.string().required("Account number is required"),
    branch_code: Yup.string(),
    iban_number: Yup.string(),
    opening_balance: Yup.number().min(0, "Opening balance cannot be negative"),
});

const fmt = (n?: number) =>
    (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const inputStyles =
    "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-inter placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
const labelStyles = "block text-xs font-medium text-slate-400 mb-1 font-inter";

interface BankFormModalProps {
    editItem: BankAccountData | null;
    onClose: () => void;
    onSaved: () => void;
}

const BankFormModal = ({ editItem, onClose, onSaved }: BankFormModalProps) => {
    const [apiError, setApiError] = useState("");
    const overlayRef = useRef<HTMLDivElement>(null);

    const formik = useFormik({
        initialValues: {
            account_name: editItem?.account_name || "",
            bank_name: editItem?.bank_name || "",
            account_number: editItem?.account_number || "",
            branch_code: editItem?.branch_code || "",
            iban_number: editItem?.iban_number || "",
            opening_balance: editItem?.opening_balance ?? 0,
        },
        validationSchema: bankSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setApiError("");
            try {
                const payload: Record<string, any> = {
                    account_name: values.account_name,
                    bank_name: values.bank_name,
                    account_number: values.account_number,
                    branch_code: values.branch_code || undefined,
                    iban_number: values.iban_number || undefined,
                };
                if (!editItem) {
                    payload.opening_balance = parseFloat(String(values.opening_balance || 0));
                }
                if (editItem) {
                    await updateBankAccount(parseInt(editItem.id || "0"), payload);
                } else {
                    await createBankAccount(payload);
                }
                onSaved();
            } catch (err: any) {
                const detail = err.response?.data?.detail;
                setApiError(
                    typeof detail === "string"
                        ? detail
                        : Array.isArray(detail)
                        ? detail.map((e: any) => e.msg).join(", ")
                        : "Failed to save bank account"
                );
            }
        },
    });

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-base font-semibold text-white font-inter">
                        {editItem ? "Edit Bank Account" : "Add Bank Account"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} noValidate className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyles}>Account Name *</label>
                            <input
                                name="account_name"
                                value={formik.values.account_name}
                                onChange={formik.handleChange}
                                placeholder="Main Operations"
                                className={inputStyles}
                            />
                            {formik.errors.account_name && formik.touched.account_name && (
                                <p className="text-red-400 text-xs mt-1 font-inter">{formik.errors.account_name}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelStyles}>Bank Name *</label>
                            <input
                                name="bank_name"
                                value={formik.values.bank_name}
                                onChange={formik.handleChange}
                                placeholder="HBL"
                                className={inputStyles}
                            />
                            {formik.errors.bank_name && formik.touched.bank_name && (
                                <p className="text-red-400 text-xs mt-1 font-inter">{formik.errors.bank_name}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyles}>Account Number *</label>
                            <input
                                name="account_number"
                                value={formik.values.account_number}
                                onChange={formik.handleChange}
                                placeholder="0123456789"
                                className={inputStyles}
                            />
                            {formik.errors.account_number && formik.touched.account_number && (
                                <p className="text-red-400 text-xs mt-1 font-inter">{formik.errors.account_number}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelStyles}>Branch Code (optional)</label>
                            <input
                                name="branch_code"
                                value={formik.values.branch_code}
                                onChange={formik.handleChange}
                                placeholder="0478"
                                className={inputStyles}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelStyles}>IBAN Number (optional)</label>
                        <input
                            name="iban_number"
                            value={formik.values.iban_number}
                            onChange={formik.handleChange}
                            placeholder="PK00HBLA0000000000000000"
                            className={inputStyles}
                        />
                    </div>

                    <div>
                        <label className={labelStyles}>Opening Balance</label>
                        <input
                            name="opening_balance"
                            type="number"
                            value={formik.values.opening_balance}
                            onChange={formik.handleChange}
                            placeholder="0"
                            className={inputStyles}
                            disabled={!!editItem}
                        />
                        {editItem && (
                            <p className="text-xs text-slate-500 font-inter mt-1">Opening balance cannot be changed after creation.</p>
                        )}
                        {formik.errors.opening_balance && formik.touched.opening_balance && (
                            <p className="text-red-400 text-xs mt-1 font-inter">{formik.errors.opening_balance as string}</p>
                        )}
                    </div>

                    {apiError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-sm font-inter">{apiError}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white font-inter transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formik.isSubmitting || (!!editItem && !formik.dirty)}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors flex items-center gap-2"
                        >
                            {formik.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editItem ? "Update" : "Add Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BankAccounts = () => {
    const { bankAccountsList, loadBankAccounts } = useFinance();
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<BankAccountData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<BankAccountData | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const deleteOverlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadBankAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaved = useCallback(async () => {
        await loadBankAccounts();
        setShowForm(false);
        setEditItem(null);
    }, [loadBankAccounts]);

    const handleEdit = (account: BankAccountData) => {
        setEditItem(account);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditItem(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError("");
        try {
            await deleteBankAccount(parseInt(deleteTarget.id || "0"));
            await loadBankAccounts();
            setDeleteTarget(null);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setDeleteError(typeof detail === "string" ? detail : "Failed to delete bank account");
        }
        setDeleting(false);
    };

    const thClass = "py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter";
    const tdClass = "py-4 px-4 text-sm text-slate-200 font-inter";

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white font-inter">Bank Accounts</h1>
                    <p className="text-sm text-slate-400 font-inter mt-1">Manage company bank accounts and track balances</p>
                </div>
                <button
                    onClick={() => { setEditItem(null); setShowForm(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium font-inter rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Account
                </button>
            </div>

            {bankAccountsList.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                    <Landmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-inter text-sm">No bank accounts yet. Add one to get started.</p>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-slate-800/50">
                                <tr className="border-b border-slate-700">
                                    <th className={thClass}>Account Name</th>
                                    <th className={thClass}>Bank</th>
                                    <th className={thClass}>Account Number</th>
                                    <th className={thClass}>Branch Code</th>
                                    <th className={thClass}>Opening Balance</th>
                                    <th className={thClass}>Income</th>
                                    <th className={thClass}>Expense</th>
                                    <th className={thClass}>Current Balance</th>
                                    <th className={`${thClass} text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bankAccountsList.map((account, i) => {
                                    const balance = account.current_balance ?? 0;
                                    const balancePositive = balance >= 0;
                                    return (
                                        <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                                            <td className={tdClass}>
                                                <div className="font-medium text-white">{account.account_name}</div>
                                                {account.iban_number && (
                                                    <div className="text-xs text-slate-500 mt-0.5 font-mono">{account.iban_number}</div>
                                                )}
                                            </td>
                                            <td className={tdClass}>{account.bank_name}</td>
                                            <td className={`${tdClass} font-mono`}>{account.account_number}</td>
                                            <td className={`${tdClass} font-mono`}>{account.branch_code || "—"}</td>
                                            <td className={tdClass}>{fmt(account.opening_balance)}</td>
                                            <td className={`${tdClass} text-emerald-400`}>{fmt(account.total_income)}</td>
                                            <td className={`${tdClass} text-red-400`}>{fmt(account.total_expense)}</td>
                                            <td className={tdClass}>
                                                <span className={`font-semibold ${balancePositive ? "text-emerald-400" : "text-red-400"}`}>
                                                    {balancePositive ? "" : "-"}{fmt(Math.abs(balance))}
                                                </span>
                                            </td>
                                            <td className={`${tdClass} text-right`}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(account)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setDeleteTarget(account); setDeleteError(""); }}
                                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && (
                <BankFormModal
                    editItem={editItem}
                    onClose={handleCloseForm}
                    onSaved={handleSaved}
                />
            )}

            {deleteTarget && (
                <div
                    ref={deleteOverlayRef}
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === deleteOverlayRef.current) setDeleteTarget(null); }}
                >
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h2 className="text-base font-semibold text-white font-inter mb-2">Delete Bank Account</h2>
                        <p className="text-sm text-slate-400 font-inter mb-1">
                            Are you sure you want to delete <span className="text-white font-medium">{deleteTarget.account_name}</span>?
                        </p>
                        <p className="text-xs text-slate-500 font-inter mb-5">
                            This cannot be undone. Accounts linked to finance records cannot be deleted.
                        </p>
                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-red-400 text-sm font-inter">{deleteError}</p>
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm text-slate-400 hover:text-white font-inter transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors flex items-center gap-2"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BankAccounts;
