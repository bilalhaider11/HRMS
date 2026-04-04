import { useRef, useState, useEffect } from "react";
import uploadImg from "../../../assets/images/uploadImg.svg";
import ImageButton from "../../../shared/ImageButton";
import FormInput from "../../../shared/FormInputs";
import Button from "../../../shared/Button";
import { EmployeeTableData } from "../modal/EmployeesContext"
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEmployees } from "../modal/EmployeesContext";
import { useNavigate } from "react-router-dom";
import SuccessfullModal from "../../../shared/SuccessfullModal";
import Select from "../../../shared/Select";
import selectArrow from "../../../assets/images/selectBoxArrow.svg"
import { createEmployee, updateEmployee as updateEmployeeApi, uploadProfilePic } from "../api/employeesApi";



const createFormSchema = Yup.object().shape({
    employeeCode: Yup.string().required("Employee Code is required"),
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
    cnic: Yup.string().required("CNIC is required"),
    designation: Yup.string().required("Designation is required"),
    department: Yup.string().required("Department is required"),
    dateOfBirth: Yup.string().required("Date of birth is required"),
    date: Yup.string().required("Joining date is required"),
    homeAddress: Yup.string().required("Home address is required"),
    bankName: Yup.string().required("Bank name is required"),
    bankTitle: Yup.string().required("Bank title is required"),
    bankAccountNumber: Yup.string().required("Account number is required"),
    bankIBAN: Yup.string().required("IBAN is required"),
    bankBranchCode: Yup.string().required("Branch code is required"),
    initialBaseSalary: Yup.number().required("Initial salary is required").min(1, "Salary must be greater than 0"),
});

const editFormSchema = Yup.object().shape({
    employeeCode: Yup.string().required("Employee Code is required"),
    name: Yup.string().required("Name is required"),
    cnic: Yup.string().required("CNIC is required"),
    designation: Yup.string().required("Designation is required"),
    department: Yup.string().required("Department is required"),
    dateOfBirth: Yup.string().required("Date of birth is required"),
    date: Yup.string().required("Joining date is required"),
    homeAddress: Yup.string().required("Home address is required"),
    bankName: Yup.string().required("Bank name is required"),
    bankTitle: Yup.string().required("Bank title is required"),
    bankAccountNumber: Yup.string().required("Account number is required"),
    bankIBAN: Yup.string().required("IBAN is required"),
    bankBranchCode: Yup.string().required("Branch code is required"),
    initialBaseSalary: Yup.number().required("Initial salary is required").min(1, "Salary must be greater than 0"),
});


const Form = () => {
    const [file, setFile] = useState<string | null>(null);
    const [fileObj, setFileObj] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addEmployee, clearError, idExistError, successfullModal, setSuccessfullModal, setEditingEmployee, editingEmployee, updateEmployee } = useEmployees();
    const [apiError, setApiError] = useState("");
    const navigate = useNavigate();
    const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
    const [departmentsDropdownOpen, setDepartmentsDropdownOpen] = useState(false)
    const [bankName, setBankName] = useState(editingEmployee?.bankName || "Select the bank")
    const [departmentName, setDepartmentName] = useState(editingEmployee?.department || "Select the Department")

    const banksOptions = ["Meezan", "UBL", "Allied", "HBL"];
    const departmentsOptions = ["Engineering", "HR", "Marketing", "Office Maintenance"]
    const additionalRoles = ["HR", "Team-Lead", "Salary Management", "Operations Management"]

    const modalRef = useRef<HTMLDivElement>(null);

    const openBanksDropdown = () => {
        setBankDropdownOpen(!bankDropdownOpen);
    };
    const openDepartmentDropdown = () => {
        setDepartmentsDropdownOpen(!departmentsDropdownOpen);
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                setBankDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const addBankName = (item: string) => {
        setBankName(item)
        setBankDropdownOpen(false)
        formik.setFieldValue('bankName', item)
    }

    const addDepartmentName = (item: string) => {
        setDepartmentName(item)
        setDepartmentsDropdownOpen(false)
        formik.setFieldValue('department', item)
    }

    const labelStyles = "block text-sm font-medium text-slate-300 mb-1 font-inter"
    const inputBorder = "mt-1.5 w-full"
    const inputStyles = "text-sm leading-normal px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
    const errorClasses = "text-red-400 text-xs mt-1 absolute -bottom-5 font-inter"

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(URL.createObjectURL(selectedFile));
            setFileObj(selectedFile);
        }
    };

    const handleSubmit = async (values: any) => {
        setApiError("");

        try {
            // Upload profile pic first if selected
            let profilePicUrl = null;
            if (fileObj) {
                profilePicUrl = await uploadProfilePic(fileObj);
            }

            if (editingEmployee !== null) {
                // Update existing employee via backend
                await updateEmployeeApi(
                    editingEmployee.id || "",
                    { ...values, profilePicUrl: profilePicUrl || editingEmployee.image }
                );

                // Update local state for immediate UI update
                updateEmployee({
                    ...editingEmployee,
                    ...values,
                    id: values.employeeCode,
                });
                formik.resetForm();
                setFile(null);
                setFileObj(null);
            } else {
                // Create new employee via backend
                await createEmployee(
                    { ...values, profilePicUrl },
                    values.additionalRoles || []
                );

                // Add to local state for immediate UI update
                const newEmployee: EmployeeTableData = {
                    id: values.employeeCode,
                    name: values.name || '',
                    department: values.department || '',
                    date: values.date as string,
                    status: 'Active',
                    email: values.email || '',
                    designation: values.designation || '',
                }
                addEmployee(newEmployee);
                formik.resetForm();
                setFile(null);
                setFileObj(null);
            }
        } catch (err: any) {
            const detail = err.response?.data?.detail || "Failed to save employee. Please try again.";
            setApiError(detail);
        }
    }


    const successfullyAdded = () => {
        setEditingEmployee(null)
        setSuccessfullModal(false)
        navigate('/employees')
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    const latestIncreament = editingEmployee?.lastIncreament?.reduce((latest, current) => {
        const latestDate = new Date(latest.increamentDate)
        const currentDate = new Date(current.increamentDate)

        return currentDate > latestDate ? current : latest;
    })

    const formik = useFormik({
        initialValues: {
            employeeCode: editingEmployee?.id || "",
            name: editingEmployee?.name || "",
            email: editingEmployee?.email || "",
            password: "",  // Never pre-fill password on edit
            cnic: editingEmployee?.cnic || "",
            designation: editingEmployee?.designation || "",
            department: editingEmployee?.department || "",
            hobbies: editingEmployee?.hobbies || "",
            vehicleRegistrationNumber: editingEmployee?.vehicleRegistrationNumber || "",
            dateOfBirth: editingEmployee?.dateOfBirth || "",
            actualDateOfBirth: editingEmployee?.actualDateOfBirth || "",
            date: editingEmployee?.date || "",
            fullTimeJoinDate: editingEmployee?.fullTimeJoinDate || "",
            lastIncreamentDate: editingEmployee ? (latestIncreament?.increamentDate) : "",
            homeAddress: editingEmployee?.homeAddress || "",
            bankName: editingEmployee?.bankName || "",
            bankTitle: editingEmployee?.bankTitle || "",
            bankAccountNumber: editingEmployee?.bankAccountNumber || "",
            bankIBAN: editingEmployee?.bankIBAN || "",
            bankBranchCode: editingEmployee?.bankBranchCode || "",
            initialBaseSalary: editingEmployee?.initialBaseSalary || "",
            currentBaseSalary: editingEmployee ? (editingEmployee.currentBaseSalary || editingEmployee.initialBaseSalary) : "",
            increamentAmount: editingEmployee ? (latestIncreament?.increamentAmount) : 0,
            additionalRoles: editingEmployee?.additionalRoles ? editingEmployee.additionalRoles.split(',').map(role => role.trim()) : [],
        },
        validationSchema: editingEmployee ? editFormSchema : createFormSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });
    useEffect(() => {
        if (editingEmployee) {
            setBankName(editingEmployee.bankName || "Select the bank")
            setDepartmentName(editingEmployee.department || "Select the Department")
        }
    }, [editingEmployee])




    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate className="mt-6 space-y-8">

                {/* Photo Upload — compact inline */}
                <div className="flex items-center gap-4">
                    <ImageButton type="button" onClick={handleClick} buttonClasses="flex-shrink-0 w-16 h-16 border border-dashed border-slate-700 hover:border-slate-500 bg-slate-800/50 rounded-full flex items-center justify-center transition-colors overflow-hidden">
                        {file ? (
                            <img src={file} alt="Uploaded preview" className="w-full h-full object-cover" />
                        ) : (
                            <img src={uploadImg} alt="profile" className="w-8 h-8 opacity-50" />
                        )}
                        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                    </ImageButton>
                    <div>
                        <p className="text-sm text-white font-inter">Profile Photo</p>
                        <p className="text-xs text-slate-500 font-inter">JPG, PNG or GIF. Max 10MB</p>
                    </div>
                </div>

                {/* Personal Info */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Personal Information</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                        <FormInput id="name"
                            name="name"
                            placeholder="Name"
                            onChange={formik.handleChange}
                            value={formik.values.name} label="Name" labelClassName={`${labelStyles}`} type="text" inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />

                        {formik.errors.name && formik.touched.name && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Employee Code"
                            type="text"
                            id="employeeCode"
                            name="employeeCode"
                            value={formik.values.employeeCode}
                            onChange={(e) => {
                                formik.handleChange(e);
                                clearError();
                            }}
                            placeholder="e.g. EMP-001" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.employeeCode && formik.touched.employeeCode && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.employeeCode}
                            </p>
                        )}
                        {idExistError && (
                            <p className={`${errorClasses}`}>
                                {idExistError}
                            </p>
                        )}
                    </div>
                    {!editingEmployee && (
                    <>
                    <div className="relative">
                        <FormInput label="Email" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} placeholder="Email" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.email && formik.touched.email && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.email}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Password" name="password" type="password" value={formik.values.password} onChange={formik.handleChange} placeholder="Password" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.password && formik.touched.password && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.password}
                            </p>
                        )}
                    </div>
                    </>
                    )}
                    <div className="relative">
                        <FormInput label="CNIC" name="cnic" value={formik.values.cnic} onChange={formik.handleChange} placeholder="12345-6789012-3" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.cnic && formik.touched.cnic && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.cnic}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Designation" name="designation" value={formik.values.designation} onChange={formik.handleChange} placeholder="CEO" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.designation && formik.touched.designation && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.designation}
                            </p>
                        )}
                    </div>
                </div>
                </div>

                {/* Work Details */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Work Details</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative" ref={modalRef}>
                        <label className={`${labelStyles}`}>Department</label>
                        <div className={`${inputBorder}`}>
                            <Select
                                onClick={openDepartmentDropdown}
                                selectClassName={`${inputStyles} ${departmentName === "Select the Department" ? "!text-slate-500" : "!text-slate-100"} cursor-pointer w-full justify-between`}
                                children={departmentName}
                                selectArrowClassName={`${departmentsDropdownOpen ? "-rotate-[180deg]" : "rotate-0"
                                    } transition-all`}
                                selectArrowPath={selectArrow}
                            />
                        </div>
                        {departmentsDropdownOpen && (
                            <div className="bodyBackground absolute top-[110px] md:top-[133px] rounded-[15px] overflow-hidden shadow-xl right-0 w-full z-[9999]">
                                <ul>
                                    {departmentsOptions.map((item, index) => (
                                        <li key={index} className="w-full">
                                            <Button
                                                type="button"
                                                onClick={() => addDepartmentName(item)}
                                                buttonClasses="border-b border-solid border-slate-700 px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
                                            >
                                                {item}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {formik.errors.department && formik.touched.department && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.department}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Hobbies" name="hobbies" value={formik.values.hobbies} onChange={formik.handleChange} placeholder="Football" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.hobbies && formik.touched.hobbies && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.hobbies}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Vehicle Registration Number" name="vehicleRegistrationNumber" value={formik.values.vehicleRegistrationNumber} onChange={formik.handleChange} placeholder="ABC-123" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.vehicleRegistrationNumber && formik.touched.vehicleRegistrationNumber && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.vehicleRegistrationNumber}
                            </p>
                        )}
                    </div>
                </div>
                </div>

                {/* Dates */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Dates</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                        <FormInput label="Date of Birth" name="dateOfBirth" type="date" placeholder="mm/dd/yyyy" value={formik.values.dateOfBirth} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.dateOfBirth === "" ? "!text-slate-500" : "!text-slate-100"}`} />
                        {formik.errors.dateOfBirth && formik.touched.dateOfBirth && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.dateOfBirth}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Actual Date of Birth" name="actualDateOfBirth" type="date" placeholder="mm/dd/yyyy" value={formik.values.actualDateOfBirth} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.actualDateOfBirth === "" ? "!text-slate-500" : "!text-slate-100"}`} />
                        {formik.errors.actualDateOfBirth && formik.touched.actualDateOfBirth && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.actualDateOfBirth}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput
                            label="Joining Date"
                            name="date"
                            type="date"
                            placeholder="mm/dd/yyyy"
                            value={formik.values.date}
                            onChange={formik.handleChange}
                            labelClassName={labelStyles}
                            inputMainBorder={inputBorder}
                            inputClassName={`${inputStyles} ${formik.values.date === "" ? "!text-slate-500" : "!text-slate-100"}`}
                        />

                        {formik.errors.date && formik.touched.date && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.date}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Full Joining Date" name="fullTimeJoinDate" type="date" placeholder="mm/dd/yyyy" value={formik.values.fullTimeJoinDate} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.fullTimeJoinDate === "" ? "!text-slate-500" : "!text-slate-100"}`} />
                    </div>
                    <div className="relative">
                        <FormInput label="Last Increment Date" name="lastIncreamentDate" type="date" placeholder="mm/dd/yyyy" value={formik.values.lastIncreamentDate} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.lastIncreamentDate === "" ? "!text-slate-500" : "!text-slate-100"}`} />
                    </div>
                </div>
                </div>

                {/* Salary & Banking */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Salary & Banking</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                        <FormInput type="number" label="Initial Base Salary" name="initialBaseSalary" value={formik.values.initialBaseSalary} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="50000" inputClassName={`${inputStyles}`} />
                        {formik.errors.initialBaseSalary && formik.touched.initialBaseSalary && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.initialBaseSalary}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput type="number" label="Current Base Salary" name="currentBaseSalary" value={formik.values.currentBaseSalary} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="50000" inputClassName={`${inputStyles}`} />
                        {formik.errors.currentBaseSalary && formik.touched.currentBaseSalary && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.currentBaseSalary}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Increment Amount" name="increamentAmount" type="number" value={formik.values.increamentAmount} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.increamentAmount && formik.touched.increamentAmount && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.increamentAmount}
                            </p>
                        )}
                    </div>
                    <div className="relative" ref={modalRef}>
                        <label className={`${labelStyles}`}>Bank Name</label>
                        <div className={`${inputBorder}`}>
                            <Select
                                onClick={openBanksDropdown}
                                selectClassName={`${inputStyles} ${bankName === "Select the bank" ? "!text-slate-500" : "!text-slate-100"} cursor-pointer w-full justify-between`}
                                children={bankName}
                                selectArrowClassName={`${bankDropdownOpen ? "-rotate-[180deg]" : "rotate-0"
                                    } transition-all`}
                                selectArrowPath={selectArrow}
                            />
                        </div>
                        {bankDropdownOpen && (
                            <div className="bodyBackground absolute top-[110px] md:top-[133px] rounded-[15px] overflow-hidden shadow-xl right-0 w-full z-[9999]">
                                <ul>
                                    {banksOptions.map((item, index) => (
                                        <li key={index} className="w-full">
                                            <Button
                                                type="button"
                                                onClick={() => addBankName(item)}
                                                buttonClasses="border-b border-solid border-slate-700 px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
                                            >
                                                {item}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {formik.errors.bankName && formik.touched.bankName && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.bankName}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput type="text" label="Bank Title" name="bankTitle" value={formik.values.bankTitle} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="Bank Ltd" inputClassName={`${inputStyles}`} />
                        {formik.errors.bankTitle && formik.touched.bankTitle && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.bankTitle}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput type="number" label="Bank Account Number" name="bankAccountNumber" value={formik.values.bankAccountNumber} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="12345678" inputClassName={`${inputStyles}`} />
                        {formik.errors.bankAccountNumber && formik.touched.bankAccountNumber && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.bankAccountNumber}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Bank IBAN" name="bankIBAN" value={formik.values.bankIBAN} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="PK36SCBL0000001123456702" inputClassName={`${inputStyles}`} />
                        {formik.errors.bankIBAN && formik.touched.bankIBAN && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.bankIBAN}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Bank Branch Code" name="bankBranchCode" value={formik.values.bankBranchCode} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="0949" inputClassName={`${inputStyles}`} />
                        {formik.errors.bankBranchCode && formik.touched.bankBranchCode && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.bankBranchCode}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Home Address" name="homeAddress" value={formik.values.homeAddress} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="House No.. Street No.." inputClassName={`${inputStyles}`} />
                        {formik.errors.homeAddress && formik.touched.homeAddress && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.homeAddress}
                            </p>
                        )}
                    </div>
                </div>
                </div>

                {/* Additional Roles */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 font-inter">Additional Roles</h3>
                    <div className="flex gap-3 flex-wrap">
                        {additionalRoles.map((item, index) => (
                            <label key={index} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formik.values.additionalRoles.includes(item)}
                                    onChange={() => {
                                        const current = formik.values.additionalRoles;
                                        if (current.includes(item)) {
                                            formik.setFieldValue('additionalRoles', current.filter((r: string) => r !== item));
                                        } else {
                                            formik.setFieldValue('additionalRoles', [...current, item]);
                                        }
                                    }}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-300 font-inter">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {apiError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-inter">{apiError}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={editingEmployee ? !formik.dirty : formik.isSubmitting}
                    className={`mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium font-inter rounded-xl transition-colors`}
                >
                    {formik.isSubmitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Register Employee'}
                </button>
            </form>
            {successfullModal &&
                <SuccessfullModal modalClassName="" modalMain="" successfullOk={successfullyAdded}>
                    {editingEmployee ? 'Successfully Updated your Employee.' : 'Successfully Registered your Employee.'}
                </SuccessfullModal>
            }
        </>
    )
}

export default Form
