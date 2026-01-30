import { useContext, useRef, useState } from "react";
import profileIcon from "../../assets/images/profileIcon.svg";
import { ThemeContext } from "../../app/ThemeContext";
import Button from "../../shared/Button";
import SettingsModal from "./SettingsModal";

interface SettingBodyProps {
  superAdmin?: boolean;
  name?: string;
  email?: string;
  password?: number;
}

export default function SettingBody({
  name,
  email,
  password,
}: SettingBodyProps) {
  const context = useContext(ThemeContext);
  const { theme, toggleTheme } = context;
  const [file, setFile] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setFile(fileUrl);
    }
  };

  const settingsHead = "w-full p-5 lg:p-7 bg-[#1E2C6D] dark:bg-[#383838] text-xl md:text-2xl lg:text-3xl"

  const handleChangePassword = () => {
    setShowSettingsModal(true);
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
  };
  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <div className="flex flex-col gap-3 text-white">
        <p className={settingsHead}>Profile Image:</p>
        <div className="flex gap-10 flex-wrap items-center">
          {file ? (
            <img
              src={file}
              alt="Uploaded preview"
              className="mt-2 w-20 h-20 lg:w-40 lg:h-40 object-cover rounded-full"
            />
          ) : (
            <img
              src={profileIcon}
              alt="profile"
              className="mt-2 w-20 h-20 lg:w-40 lg:h-40 object-cover rounded-full"
            />
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              buttonClasses="buttonColor px-5 py-4 pb-5 rounded-[10px] text-white text-base md:text-lg lg:text-xl font-inter font-medium lg:leading-[17px] text-center"
              onClick={handleClick}
            >
              Change Image
            </Button>
            <Button buttonClasses="buttonColor px-5 py-4 pb-5 rounded-[10px] text-white text-base md:text-lg lg:text-xl font-inter font-medium lg:leading-[17px] text-center">
              Save
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-3 mt-6">
        <div className="w-full flex flex-col gap-3 text-white">
          <p className={settingsHead}>Your Name:</p>
          <h1 className="text-xl md:text-2xl lg:text-3xl mt-4 px-7 capitalize">{name}</h1>
        </div>
        <div className="w-full flex flex-col gap-3 text-white">
          <p className={settingsHead}>Your Email:</p>
          <h1 className="text-xl md:text-2xl lg:text-3xl mt-4 px-7">{email}</h1>
        </div>
        <div className="w-full flex flex-col gap-3 text-white">
          <p className={settingsHead}>Your Password:</p>
          <div className="flex flex-wrap gap-5 justify-between mt-3.5 items-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl px-7">********</h1>
            <Button onClick={handleChangePassword} buttonClasses="buttonColor px-5 py-4 pb-5 rounded-[10px] text-white text-base md:text-lg lg:text-xl font-inter font-medium lg:leading-[17px] text-center">
              Change Password
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <Button
          buttonClasses="bg-[#1E2C6D] dark:bg-[#383838]  dark:bg-black  px-5 py-4 pt-4.5 rounded-[10px] text-white text-xl font-inter font-medium leading-[17px] text-center"
          onClick={toggleTheme}
        >
          {theme === "light" ? "Switch to Dark" : "Switch to Light"}
        </Button>
      </div>
      {showSettingsModal && <SettingsModal closeModal={handleCloseSettingsModal} previousPassword={password?.toString() || ""} />}
    </>
  );
}
