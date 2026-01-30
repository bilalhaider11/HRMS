import { useRef, useState } from "react";
import Modal from "../../shared/Modal";
import Button from "shared/Button";
import SuccessfullModal from "shared/SuccessfullModal";

const SettingsModal = ({
  closeModal,
  previousPassword,
}: {
  closeModal: () => void;
  previousPassword: string;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [checkPreviousPassword, setCheckPreviousPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showSuccessfullModal, setShowSuccessfullModal] = useState(false);
  const [isPreviousPasswordVerified, setIsPreviousPasswordVerified] =
    useState(false);
  const [showPreviousPasswordError, setShowPreviousPasswordError] =
    useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPasswordError, setShowConfirmPasswordError] =
    useState(false);
  const handleVerifyPreviousPassword = () => {
    if (checkPreviousPassword === previousPassword) {
      setIsPreviousPasswordVerified(true);
      setShowPreviousPasswordError(false);
    } else {
      setIsPreviousPasswordVerified(false);
      setShowPreviousPasswordError(true);
    }
  };

  const handleSubmit = () => {
    closeModal();
    setShowSuccessfullModal(true);
  };

  return (
    <>
      <Modal
        ref={modalRef}
        closeButtonCLick={closeModal}
        modalClassName="min-h-[300px]"
      >
        <h1 className="text-2xl text-center font-urbanist leading-[150%] text-white border-b border-solid border-[#CDD6D7] p-6">
          Change The Password
        </h1>
        <div className="mt-5 px-5 py-5">
          <h3 className="text-xl text-white font-urbanist leading-[160%] font-semibold">
            Previous Password
          </h3>
          <input
            type="password"
            value={checkPreviousPassword}
            onChange={(e) => {
              setCheckPreviousPassword(e.target.value);
              setIsPreviousPasswordVerified(false);
              setShowPreviousPasswordError(false);
            }}
            className="w-full bg-[#F5F5F5] outline-none border-none px-4 py-3 placeholder-[#04091E99] text-black font-urbanist leading-normal text-base"
          />
          {showPreviousPasswordError && (
            <p className="text-red-500 text-xs mt-1">
              Previous password is incorrect
            </p>
          )}
          <h3 className="text-xl text-white font-urbanist leading-[160%] font-semibold mt-4">
            Confirm Password
          </h3>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#F5F5F5] outline-none border-none px-4 py-3 placeholder-[#04091E99] text-black font-urbanist leading-normal text-base"
          />
          {showConfirmPasswordError && (
            <p className="text-red-500 text-xs mt-1">
              Confirm password is incorrect
            </p>
          )}
          {confirmPassword !== newPassword && (
            <p className="text-red-500 text-xs mt-1">
              Confirm password does not match with new password
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleVerifyPreviousPassword}
              buttonClasses="buttonColor px-5 py-4 pb-5 rounded-[10px] text-white text-xl font-inter font-medium leading-[17px] text-center"
            >
              OK
            </Button>
            <Button
              onClick={() => {
                setCheckPreviousPassword("");
                setIsPreviousPasswordVerified(false);
                setShowPreviousPasswordError(false);
              }}
              buttonClasses="buttonColor px-5 py-4 pb-5 rounded-[10px] text-white text-xl font-inter font-medium leading-[17px] text-center"
            >
              Clear
            </Button>
          </div>
          <h3 className="text-xl text-white font-urbanist leading-[160%] font-semibold mt-4">
            New Password
          </h3>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#F5F5F5] outline-none border-none px-4 py-3 placeholder-[#04091E99] text-black font-urbanist leading-normal text-base"
          />
          <Button
            onClick={handleSubmit}
            buttonClasses="buttonColor px-5 py-4 pb-5 rounded-[10px] text-white text-xl font-inter font-medium leading-[17px] text-center mt-4"
          >
            Change Password
          </Button>
        </div>
      </Modal>
      {showSuccessfullModal && (
        <SuccessfullModal
          modalClassName=""
          modalMain=""
          successfullOk={() => setShowSuccessfullModal(false)}
        >
          <h1 className="text-2xl text-center font-urbanist leading-[150%] text-white">
            Password changed successfully
          </h1>
        </SuccessfullModal>
      )}
    </>
  );
};

export default SettingsModal;
