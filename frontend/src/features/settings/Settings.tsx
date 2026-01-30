
import SettingBody from "./SettingBody";
import { useContext } from "react";
import { VerifyContext } from "../../app/VerifyContext";
interface SettingProps {
}

export default function Setting({}: SettingProps) {
  const { user, superAdmin } = useContext(VerifyContext);
  console.log(user, "user");
  return (
    <>
     <div className="">
      <h1 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white mb-7">
        Settings
      </h1>
      <SettingBody superAdmin={superAdmin} name={user?.name} email={user?.email} password={user?.password as number} />
      </div>
    </>
  );
}
