import SettingBody from "./SettingBody";
import { useContext } from "react";
import { VerifyContext } from "../../app/VerifyContext";

export default function Setting() {
  const { user, superAdmin } = useContext(VerifyContext);
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white font-inter">Settings</h1>
        <p className="text-sm text-slate-400 font-inter mt-1">Manage your account and preferences</p>
      </div>
      <SettingBody superAdmin={superAdmin} name={user?.name} email={user?.email} />
    </div>
  );
}
