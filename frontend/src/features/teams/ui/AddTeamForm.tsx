import Button from "shared/Button";
import FormInput from "../../../shared/FormInputs";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  useTeams,
  TeamsTableData,
  EmployeeTableData,
} from "../modal/teamsContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessfullModal from "shared/SuccessfullModal";
import Select from "shared/Select";
import selectArrow from "../../../assets/images/selectBoxArrow.svg";
import deleteIcon from "../../../assets/images/delete.svg";
import AddMemberModal from "./AddMemberModal";

const formSchema = Yup.object().shape({
  teamName: Yup.string().required("Team Name is required"),
  teamDescription: Yup.string().required("Team Description is required"),
  teamLeadName: Yup.string().required("Team Lead Name is required"),
});

const AddTeamForm = () => {
  const navigate = useNavigate();
  const {
    addTeam,
    clearError,
    idExistError,
    successfullModal,
    setSuccessfullModal,
    setEditingTeam,
    editingTeam,
    updateTeam,
    employeeList,
    isOpenMembersModal,
    handleAddMemberModal,
    selectedMembers,
    removeMember,
  } = useTeams();

  const labelStyles =
    "font-urbanist font-semibold text-base md:text-lg lg:text-[21px] lg:leading-[180%] text-white";
  const inputBorder = "inputMainBorder mt-3.5 w-full rounded-[8px]";
  const inputStyles =
    "inputBox text-sm md:text-base leading-normal px-4 py-2.5 lg:py-[21px] lg:px-[29px] rounded-[15px] text-white placeholder-[#747681]";
  const errorClasses = "text-red-500 text-xs mt-1 absolute -bottom-6";

  const [generatedTeamId] = useState<string>(uuidv4());
  const [teamLeadDropdownOpen, setTeamLeadDropdownOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (values: any) => {
    console.log(editingTeam);
    if (editingTeam !== null && updateTeam) {
      const updatedTeam = {
        ...editingTeam,
        ...values,
        teamMembers: selectedMembers.map((member) => ({
          id: member.id,
          name: member.name,
        })), // Include selectedMembers in update
      };
      updateTeam(updatedTeam);
      formik.resetForm();
    } else {
      const newTeam: TeamsTableData = {
        teamId: parseInt(values.teamId || ""),
        teamName: values.teamName,
        teamDescription: values.teamDescription,
        teamLeadName: values.teamLeadName,
        companyName: values.companyName,
        teamMembers: selectedMembers.map((member) => ({
          id: member.id,
          name: member.name,
        })),
      };
      const added = addTeam(newTeam);
      console.log(added);
      if (added) {
        formik.resetForm();
      }
    }
  };

  const openTeamLeadDropdown = () => {
    setTeamLeadDropdownOpen(!teamLeadDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setTeamLeadDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const addTeamLeadName = (item: string | undefined) => {
    const name = item || "Unknown";
    setTeamLeadDropdownOpen(false);
    formik.setFieldValue("teamLeadName", name);
  };

  const formik = useFormik({
    initialValues: {
      teamId: editingTeam?.teamId || generatedTeamId,
      teamName: editingTeam?.teamName || "",
      teamDescription: editingTeam?.teamDescription || "",
      teamLeadName: editingTeam?.teamLeadName || "",
      companyName: editingTeam?.companyName || "Celestial Technologies",
      teamMembers:
        editingTeam?.teamMembers || [],
    },
    validationSchema: formSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });
  const successfullyAdded = () => {
    setEditingTeam(null);
    setSuccessfullModal(false);
    navigate("/teams");
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
  };
  console.log(selectedMembers, "selected members");
  console.log(editingTeam?.teamLeadName, "team");
  return (
    <>
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="grid md:grid-cols-2 gap-3 md:gap-5 lg:gap-[38px]">
          <div className="relative">
            <FormInput
              label="Id"
              type="text"
              id="teamId"
              name="teamId"
              value={formik.values.teamId}
              onChange={(e) => {
                formik.handleChange(e);
                clearError();
              }}
              readOnly
              placeholder="Team ID"
              labelClassName={`${labelStyles}`}
              inputMainBorder={`${inputBorder}`}
              inputClassName={`${inputStyles}`}
            />
          </div>
          <div className="relative">
            <FormInput
              label="Team Name"
              name="teamName"
              type="text"
              placeholder="Team Name"
              value={formik.values.teamName}
              onChange={formik.handleChange}
              labelClassName={`${labelStyles}`}
              inputMainBorder={`${inputBorder}`}
              inputClassName={`${inputStyles}`}
            />
            {formik.errors.teamName && formik.touched.teamName && (
              <p className={`${errorClasses}`}>{formik.errors.teamName}</p>
            )}
          </div>

          <div className="relative">
            <FormInput
              label="Company Name"
              name="companyName"
              type="text"
              readOnly
              value={editingTeam?.companyName || "Celestials Technology"}
              onChange={formik.handleChange}
              labelClassName={`${labelStyles}`}
              inputMainBorder={`${inputBorder}`}
              inputClassName={`${inputStyles}`}
            />
          </div>
          <div className="relative" ref={modalRef}>
            <label className={`${labelStyles}`}>Select Team Lead</label>
            <div className={`${inputBorder}`}>
              <Select
                onClick={openTeamLeadDropdown}
                selectClassName={`${inputStyles} ${
                  formik.values.teamLeadName === "Select the Team Lead"
                    ? "!text-[#747681]"
                    : "!text-white"
                } cursor-pointer w-full justify-between`}
                children={formik.values.teamLeadName || "Select the Team Lead"}
                selectArrowClassName={`${
                  teamLeadDropdownOpen ? "-rotate-[180deg]" : "rotate-0"
                } transition-all`}
                selectArrowPath={selectArrow}
              />
            </div>
            {teamLeadDropdownOpen && (
              <div className="bodyBackground absolute top-[110px] md:top-[133px] rounded-[15px] overflow-hidden shadow-xl right-0 w-full z-[9999]">
                <ul>
                  {employeeList.map(
                    (item: EmployeeTableData, index: number) => (
                      <li key={index} className="w-full">
                        <Button
                          type="button"
                          onClick={() => addTeamLeadName(item.name)}
                          buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
                        >
                          {item.name}
                        </Button>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {formik.errors.teamLeadName && formik.touched.teamLeadName && (
              <p className={`${errorClasses}`}>{formik.errors.teamLeadName}</p>
            )}
          </div>
          <div className="relative">
            <label className={`${labelStyles}`}>Description</label>
            <div className={`${inputBorder} h-[76%]`}>
              <textarea
                className={`${inputStyles} w-full h-[181px] outline-none`}
                value={formik.values.teamDescription}
                onChange={formik.handleChange}
                name="teamDescription"
              />
            </div>
            {formik.errors.teamDescription &&
              formik.touched.teamDescription && (
                <p className={`${errorClasses}`}>
                  {formik.errors.teamDescription}
                </p>
              )}
          </div>
          <div className="relative">
            <label className={`${labelStyles}`}>Add Memebers</label>
            <div>
              <Button
                type="button"
                onClick={handleAddMemberModal}
                className={`${inputBorder} text-white !w-full !h-[46px]`}
              >
                Add
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 justify-between mt-5">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white text-black rounded-[10px] p-2 flex gap-4 justify-between"
                >
                  {member.name} 
                  <button type="button" onClick={() => removeMember(member)}>
                    <img src={deleteIcon} alt="delete" className="w-6 h-6"/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!formik.dirty}
          buttonClasses={`min-h-10 lg:min-h-[64px] border border-[#CDD6D7] border-solid bg-[#283573] py-3 px-2 lg:py-5 lg:px-[75px] rounded-[15px] flex mx-auto lg:mx-0 mt-4 md:mt-[58px] text-base md:text-lg lg:text-2xl font-semibold lg:leading-[160%] font-urbanist text-white min-w-[200px] lg:min-w-auto w-fit`}
        >
          {editingTeam ? "Update" : "Register"}
        </Button>
      </form>
      {successfullModal && (
        <SuccessfullModal
          modalClassName=""
          modalMain=""
          successfullOk={successfullyAdded}
        >
          {editingTeam
            ? "Successfully Updated your Team."
            : "Successfully Registered your Team."}
        </SuccessfullModal>
      )}
      {isOpenMembersModal && <AddMemberModal />}
    </>
  );
};
export default AddTeamForm;
