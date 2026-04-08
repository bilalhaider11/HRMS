import { useContext, useEffect, useState } from "react";
import { Mail, Lock, Building2, Globe, MapPin, Phone, Pencil, Loader2, Key, Wallet } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import { VerifyContext } from "../../app/VerifyContext";
import api from "api/axios";
import { updateOpeningBalance } from "../finance/api/financeApi";

interface CompanyProfile {
  company_name: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  opening_balance?: number;
}

export default function Setting() {
  const { setUser } = useContext(VerifyContext);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [editingAccessKey, setEditingAccessKey] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState("");
  const [accessKeySaving, setAccessKeySaving] = useState(false);
  const [accessKeyError, setAccessKeyError] = useState("");
  const [accessKeySuccess, setAccessKeySuccess] = useState(false);

  // Opening balance
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [editingOpeningBalance, setEditingOpeningBalance] = useState(false);
  const [openingBalanceInput, setOpeningBalanceInput] = useState("");
  const [openingBalanceSaving, setOpeningBalanceSaving] = useState(false);
  const [openingBalanceError, setOpeningBalanceError] = useState("");
  const [openingBalanceSuccess, setOpeningBalanceSuccess] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<CompanyProfile>({
    company_name: "", website: "", address: "", phone: "", email: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/company_profile");
        setProfile(res.data);
        setFormData(res.data);
        setAccessKey(res.data.access_key || "");
        setAccessKeyInput(res.data.access_key || "");
        setOpeningBalance(res.data.opening_balance ?? 0);
        setOpeningBalanceInput(String(res.data.opening_balance ?? 0));
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setSaveError("");
    setSaveSuccess(false);
    if (profile) setFormData(profile);
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError("");
    if (profile) setFormData(profile);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await api.patch("/admin/update_company_profile", formData);
      setProfile(formData);
      setEditing(false);
      setSaveSuccess(true);
      // Update sidebar name/email
      setUser({ name: formData.company_name, email: formData.email });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || "Failed to update profile");
    }
    setSaving(false);
  };

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccessKeySave = async () => {
    if (!accessKeyInput.trim()) {
      setAccessKeyError("Access key cannot be empty");
      return;
    }
    setAccessKeySaving(true);
    setAccessKeyError("");
    setAccessKeySuccess(false);
    try {
      await api.patch("/admin/update_access_key", { access_key: accessKeyInput.trim() });
      setAccessKey(accessKeyInput.trim());
      setEditingAccessKey(false);
      setAccessKeySuccess(true);
      setTimeout(() => setAccessKeySuccess(false), 3000);
    } catch (err: any) {
      setAccessKeyError(err.response?.data?.detail || "Failed to update access key");
    }
    setAccessKeySaving(false);
  };

  const handleOpeningBalanceSave = async () => {
    const val = parseFloat(openingBalanceInput);
    if (isNaN(val)) {
      setOpeningBalanceError("Please enter a valid number");
      return;
    }
    setOpeningBalanceSaving(true);
    setOpeningBalanceError("");
    setOpeningBalanceSuccess(false);
    try {
      await updateOpeningBalance(val);
      setOpeningBalance(val);
      setEditingOpeningBalance(false);
      setOpeningBalanceSuccess(true);
      setTimeout(() => setOpeningBalanceSuccess(false), 3000);
    } catch (err: any) {
      setOpeningBalanceError(err.response?.data?.detail || "Failed to update opening balance");
    }
    setOpeningBalanceSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const infoRows: { icon: any; label: string; field: keyof CompanyProfile; placeholder: string }[] = [
    { icon: Building2, label: "Company Name", field: "company_name", placeholder: "Acme Inc" },
    { icon: Mail, label: "Email", field: "email", placeholder: "admin@company.com" },
    { icon: Phone, label: "Phone", field: "phone", placeholder: "+92 300 1234567" },
    { icon: Globe, label: "Website", field: "website", placeholder: "https://company.com" },
    { icon: MapPin, label: "Address", field: "address", placeholder: "123 Main St, City" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white font-inter">Settings</h1>
        <p className="text-sm text-slate-400 font-inter mt-1">Manage your company profile and account</p>
      </div>

      {/* Company Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-inter">Company Profile</h2>
          {!editing && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-inter font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-sm font-inter">Profile updated successfully</p>
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-inter">{saveError}</p>
          </div>
        )}

        <div className="space-y-4">
          {infoRows.map(({ icon: Icon, label, field, placeholder }) => (
            <div key={field} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-inter">{label}</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-inter placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-sm text-white font-inter mt-0.5">{profile?.[field] || "—"}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white font-inter transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors flex items-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Security Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5 font-inter">Security</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-inter">Password</p>
              <p className="text-sm text-slate-400 font-inter mt-0.5">••••••••</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-inter font-medium transition-colors"
          >
            Change Password
          </button>
        </div>

        <div className="border-t border-slate-800 mt-5 pt-5">
          {accessKeySuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 text-sm font-inter">Access key updated successfully</p>
            </div>
          )}
          {accessKeyError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm font-inter">{accessKeyError}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-inter">Access Key</p>
                {editingAccessKey ? (
                  <input
                    type="text"
                    value={accessKeyInput}
                    onChange={(e) => setAccessKeyInput(e.target.value)}
                    placeholder="Enter new access key"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-inter placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-sm text-slate-400 font-inter mt-0.5 font-mono">{accessKey || "—"}</p>
                )}
              </div>
            </div>
            {editingAccessKey ? (
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => { setEditingAccessKey(false); setAccessKeyInput(accessKey); setAccessKeyError(""); }} className="text-sm text-slate-400 hover:text-white font-inter transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleAccessKeySave}
                  disabled={accessKeySaving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium font-inter rounded-lg transition-colors"
                >
                  {accessKeySaving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingAccessKey(true); setAccessKeyInput(accessKey); setAccessKeyError(""); setAccessKeySuccess(false); }}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-inter font-medium transition-colors"
              >
                Change
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Finance Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mt-6">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5 font-inter">Finance</h2>

        {openingBalanceSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-sm font-inter">Opening balance updated successfully</p>
          </div>
        )}
        {openingBalanceError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-inter">{openingBalanceError}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-inter">Opening Balance</p>
              {editingOpeningBalance ? (
                <input
                  type="number"
                  value={openingBalanceInput}
                  onChange={(e) => setOpeningBalanceInput(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-inter placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              ) : (
                <p className="text-sm text-white font-inter mt-0.5">{openingBalance.toLocaleString()}</p>
              )}
            </div>
          </div>
          {editingOpeningBalance ? (
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => { setEditingOpeningBalance(false); setOpeningBalanceInput(String(openingBalance)); setOpeningBalanceError(""); }} className="text-sm text-slate-400 hover:text-white font-inter transition-colors">
                Cancel
              </button>
              <button
                onClick={handleOpeningBalanceSave}
                disabled={openingBalanceSaving}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium font-inter rounded-lg transition-colors"
              >
                {openingBalanceSaving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingOpeningBalance(true); setOpeningBalanceInput(String(openingBalance)); setOpeningBalanceError(""); setOpeningBalanceSuccess(false); }}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-inter font-medium transition-colors ml-4"
            >
              Change
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 font-inter mt-3 ml-14">
          The starting balance before any transactions. Used to compute the current running balance.
        </p>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
