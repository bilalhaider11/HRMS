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
import { v4 as uuidv4 } from "uuid";



const formSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    employeeId: Yup.string().required("ID is required"),
    department: Yup.string().required("Department is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
    cnic: Yup.string().required("CNIC is required"),
    designation: Yup.string().required("Designation is required"),
    team: Yup.string().required("Team is required"),
    hobbies: Yup.string().required("Hobbies are required"),
    vehicleRegistrationNumber: Yup.string().required("Vehicle number is required"),
    companyId: Yup.string().required("Company ID is required"),
    dateOfBirth: Yup.string().required("Date of birth is required"),
    actualDateOfBirth: Yup.string().required("Actual DOB is required"),
    bankName: Yup.string().required("Bank name is required"),
    bankTitle: Yup.string().required("Bank title is required"),
    bankAccountNumber: Yup.number().required("Account number is required"),
    bankIBAN: Yup.string().required("IBAN is required"),
    bankBranchCode: Yup.string().required("Branch code is required"),
    initialBaseSalary: Yup.string().required("Salary is required"),
    currentBaseSalary: Yup.string().required("Current Salary is required"),
    increamentAmount: Yup.number().required("Increment is required"),
    lastIncreamentId: Yup.string().required("Increment ID is required"),
    homeAddress: Yup.string().required("Home address is required"),
    status: Yup.string().required("Status is required"),
    date: Yup.string().required("Joining date is required"),
});


const Form = () => {
    const [file, setFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addEmployee, clearError, idExistError, successfullModal, setSuccessfullModal, setEditingEmployee, editingEmployee, updateEmployee, employeesList } = useEmployees();
    const navigate = useNavigate();
    const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
    const [departmentsDropdownOpen, setDepartmentsDropdownOpen] = useState(false)
    const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)
    const [bankName, setBankName] = useState(editingEmployee?.bankName || "Select the bank")
    const [departmentName, setDepartmentName] = useState(editingEmployee?.department || "Select the Department")
    const [teamName, setTeamName] = useState(editingEmployee?.team || "Select the team")


    const [generatedEmployeeId] = useState<string>(uuidv4());
    const [generatedIncreamentId] = useState<string>(uuidv4())
    console.log(generatedEmployeeId)

    const banksOptions = ["Meezan", "UBL", "Allied", "HBL"];
    const departmentsOptions = ["Engineering", "HR", "Marketing", "Office Maintenance"]
    const teamOptions = ["Frontend team", "Mern Stack team", "PHP / Coldfusion team"]
    const additionalRoles = ["HR", "Team-Lead", "Salary Management", "Operations Management"]

    const modalRef = useRef<HTMLDivElement>(null);

    const openBanksDropdown = () => {
        setBankDropdownOpen(!bankDropdownOpen);
    };
    const openDepartmentDropdown = () => {
        setDepartmentsDropdownOpen(!departmentsDropdownOpen);
    };
    const openteamsDropdown = () => {
        setTeamDropdownOpen(!teamDropdownOpen);
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

    const addTeamName = (item: string) => {
        setTeamName(item)
        setTeamDropdownOpen(false)
        formik.setFieldValue('team', item)
    }

    const labelStyles = "font-urbanist font-semibold text-base md:text-lg lg:text-[21px] lg:leading-[180%] text-white"
    const inputBorder = "inputMainBorder mt-3.5 w-full rounded-[8px]"
    const inputStyles = "inputBox text-sm md:text-base leading-normal px-4 py-2.5 lg:py-[21px] lg:px-[29px] rounded-[15px] text-white placeholder-[#747681]"
    const errorClasses = "text-red-500 text-xs mt-1 absolute -bottom-6"

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
            formik.setFieldValue('image', fileUrl);
        }
    };

    const handleSubmit = (values: any) => {
        if (editingEmployee !== null && updateEmployee) {
            const updatedEmployee = {
                ...editingEmployee,
                ...values,
            };
            updateEmployee(updatedEmployee);
            formik.resetForm();
        } else {
            const newEmployee: EmployeeTableData = {
                id: values.employeeId,
                name: values.name || '',
                department: values.department || '',
                employeeInformation: values.employeeInformation || '',
                date: values.date as string,
                fullTimeJoinDate: values.fullTimeJoinDate as string,
                lastIncreamentDate: values.lastIncreamentDate as string,
                status: 'Active',
                email: values.email || '',
                password: values.password || '',
                cnic: values.cnic || '',
                designation: values.designation || '',
                team: values.team || '',
                hobbies: values.hobbies || '',
                vehicleRegistrationNumber: values.vehicleRegistrationNumber || '',
                companyId: values.companyId || '',
                dateOfBirth: values.dateOfBirth || '',
                actualDateOfBirth: values.actualDateOfBirth || '',
                bankName: values.bankName || '',
                bankTitle: values.bankTitle || '',
                bankAccountNumber: values.bankAccountNumber || '',
                bankIBAN: values.bankIBAN || '',
                bankBranchCode: values.bankBranchCode || '',
                initialBaseSalary: values.initialBaseSalary || '',
                currentBaseSalary: values.currentBaseSalary || '',
                lastIncreament: values.increamentAmount || '',
                lastIncreamentId: values.lastIncreamentId,
                homeAddress: values.homeAddress || '',
                image: values.image || '',
                additionalRoles: values.additionalRoles.join(', ') || ''
            }
            const added = addEmployee(newEmployee);
            console.log(added)
            if (added) {
                formik.resetForm();
                setFile(null);
            }
        }
    }
    console.log(successfullModal)


    const successfullyAdded = () => {
        setEditingEmployee(null)
        setSuccessfullModal(false)
        navigate('/employees')
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    const [isEditClick, setIsEditClick] = useState(false);
    const [isEditfullTimeJoin, setIsEditFullTimeJoin] = useState(false)
    const [isEditDateOfBirth, setIsEditDateOfBirth] = useState(false)
    const [isEditLastIncreamentDate, setIsEditLastIncreamentDate] = useState(false)
    const editCurrentBaseSalary = () => {
        setIsEditClick(!isEditClick)
    }

    const editfullTimeJoinDate = () => {
        setIsEditFullTimeJoin(!isEditfullTimeJoin)
    }

    const editDateOfBirth = () => {
        setIsEditDateOfBirth(!isEditDateOfBirth)
    }
    const editIncreamentDate = () => {
        setIsEditLastIncreamentDate(!isEditLastIncreamentDate)
    }


    const latestIncreament = editingEmployee?.lastIncreament?.reduce((latest, current) => {
        const latestDate = new Date(latest.increamentDate)
        const currentDate = new Date(current.increamentDate)

        return currentDate > latestDate ? current : latest;
    })

    const formik = useFormik({
        initialValues: {
            name: editingEmployee?.name || "",
            employeeId: editingEmployee?.id || generatedEmployeeId,
            department: editingEmployee?.department || "",
            email: editingEmployee?.email || "",
            password: editingEmployee?.password || "",
            cnic: editingEmployee?.cnic || "",
            designation: editingEmployee?.designation || "",
            team: editingEmployee?.team || "",
            hobbies: editingEmployee?.hobbies || "",
            vehicleRegistrationNumber: editingEmployee?.vehicleRegistrationNumber || "",
            companyId: editingEmployee?.companyId || "",
            dateOfBirth: editingEmployee?.dateOfBirth || "",
            actualDateOfBirth: editingEmployee?.actualDateOfBirth || "",
            bankName: editingEmployee?.bankName || "",
            bankTitle: editingEmployee?.bankTitle || "",
            bankAccountNumber: editingEmployee?.bankAccountNumber || "",
            bankIBAN: editingEmployee?.bankIBAN || "",
            bankBranchCode: editingEmployee?.bankBranchCode || "",
            initialBaseSalary: editingEmployee?.initialBaseSalary || "",
            currentBaseSalary: editingEmployee ? (editingEmployee.currentBaseSalary || editingEmployee.initialBaseSalary) : "",
            increamentAmount: editingEmployee ? (latestIncreament?.increamentAmount) : 0,
            homeAddress: editingEmployee?.homeAddress || "",
            status: editingEmployee?.status || "Active",
            date: editingEmployee?.date || "",
            fullTimeJoinDate: editingEmployee?.fullTimeJoinDate || "",
            lastIncreamentDate: editingEmployee ? (latestIncreament?.increamentDate) : "",
            lastIncreamentId: editingEmployee ? (latestIncreament?.increamentId) : generatedIncreamentId,
            additionalRoles: editingEmployee?.additionalRoles ? editingEmployee.additionalRoles.split(',').map(role => role.trim()) : [],
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });
    useEffect(() => {
        if (editingEmployee) {
            setBankName(editingEmployee.bankName || "Select the bank")
            setDepartmentName(editingEmployee.department || "Select the Department")
            setTeamName(editingEmployee.team || "Select the Team")
        }
    }, [editingEmployee])



    console.log(formik.values.name, "Values")
    console.log(editingEmployee?.name)

    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate className="mt-6 flex flex-col gap-[38px]">
                <div>
                    <p className="font-urbanist font-medium text-base md:text-lg lg:text-[21px] lg:leading-[180%] text-[#FFFFFF99] mb-[38px]">
                        Image, Video, Audio, or 3D Model. File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 100 MB
                    </p>
                    <div>
                        <label className={`${labelStyles}`}>Upload File</label>
                        <ImageButton type="button" onClick={handleClick} buttonClasses="mt-3.5 border border-dashed border-[#747681] w-full max-w-[484px] min-h-[300px] lg:min-h-[484px] flex items-center justify-center">
                            {file ? (
                                <img
                                    src={file}
                                    alt="Uploaded preview"
                                    className="w-[100px] h-[100px] lg:w-[145px] lg:h-[145px] object-cover rounded-full"
                                />
                            ) : (
                                <img
                                    src={uploadImg}
                                    alt="profile"
                                    className="w-[100px] h-[100px] lg:w-[145px] lg:h-[145px] object-cover rounded-full"
                                />
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                        </ImageButton>
                    </div>

                </div>
                <div className="grid md:grid-cols-2 gap-3 md:gap-5 lg:gap-[38px]">
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
                        <FormInput label="Id"
                            type="text"
                            id="employeeId"
                            name="employeeId"
                            value={formik.values.employeeId}
                            onChange={(e) => {
                                formik.handleChange(e);
                                clearError();
                            }}
                            readOnly
                            placeholder="Employee ID" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.employeeId && formik.touched.employeeId && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.employeeId}
                            </p>
                        )}
                        {idExistError && (
                            <p className={`${errorClasses}`}>
                                {idExistError}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Email" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} placeholder="Email" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.email && formik.touched.email && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.email}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Password" name="password" type="text" value={formik.values.password} onChange={formik.handleChange} placeholder="Password" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.password && formik.touched.password && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.password}
                            </p>
                        )}
                    </div>
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
                    <div className="relative" ref={modalRef}>
                        <label className={`${labelStyles}`}>Department</label>
                        <div className={`${inputBorder}`}>
                            <Select
                                onClick={openDepartmentDropdown}
                                selectClassName={`${inputStyles} ${departmentName === "Select the Department" ? "!text-[#747681]" : "!text-white"} cursor-pointer w-full justify-between`}
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
                                                buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
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
                    <div className="relative" ref={modalRef}>
                        <label className={`${labelStyles}`}>Team Name</label>
                        <div className={`${inputBorder}`}>
                            <Select
                                onClick={openteamsDropdown}
                                selectClassName={`${inputStyles} ${teamName === "Select the team" ? "!text-[#747681]" : "!text-white"} cursor-pointer w-full justify-between`}
                                children={teamName}
                                selectArrowClassName={`${teamDropdownOpen ? "-rotate-[180deg]" : "rotate-0"
                                    } transition-all`}
                                selectArrowPath={selectArrow}
                            />
                        </div>
                        {teamDropdownOpen && (
                            <div className="bodyBackground absolute top-[110px] md:top-[133px] rounded-[15px] overflow-hidden shadow-xl right-0 w-full z-[9999]">
                                <ul>
                                    {teamOptions.map((item, index) => (
                                        <li key={index} className="w-full">
                                            <Button
                                                type="button"
                                                onClick={() => addTeamName(item)}
                                                buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
                                            >
                                                {item}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {formik.errors.team && formik.touched.team && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.team}
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
                    <div className="relative">
                        <FormInput label="Company ID" name="companyId" value={formik.values.companyId} onChange={formik.handleChange} placeholder="321" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.companyId && formik.touched.companyId && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.companyId}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Date of Birth" name="dateOfBirth" type="date" placeholder="mm/dd/yyyy" value={formik.values.dateOfBirth} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.dateOfBirth === "" ? "!text-[#747681]" : "!text-white"}`} />
                        {formik.errors.dateOfBirth && formik.touched.dateOfBirth && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.dateOfBirth}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        {!isEditDateOfBirth ?
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editDateOfBirth}>Edit</Button>
                            :
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editDateOfBirth}>Cancel</Button>
                        }
                        {isEditDateOfBirth ?
                            <FormInput label="Actual Date of Birth" name="actualDateOfBirth" type="date" placeholder="mm/dd/yyyy" value={formik.values.actualDateOfBirth} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.actualDateOfBirth === "" ? "!text-[#747681]" : "!text-white"}`} /> :
                            <FormInput label="Actual Date of Birth" name="actualDateOfBirth" type="date" placeholder="mm/dd/yyyy" value={formik.values.dateOfBirth} readOnly onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.dateOfBirth === "" ? "!text-[#747681]" : "!text-white"}`} />
                        }
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
                            inputClassName={`${inputStyles} ${formik.values.date === "" ? "!text-[#747681]" : "!text-white"}`}
                        />

                        {formik.errors.date && formik.touched.date && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.date}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        {!isEditfullTimeJoin ?
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editfullTimeJoinDate}>Edit</Button> :
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editfullTimeJoinDate}>Cancel</Button>
                        }
                        {isEditfullTimeJoin ?
                            <>
                                <FormInput label="Full Joining Date" name="fullTimeJoinDate" type="date" placeholder="mm/dd/yyyy" value={formik.values.fullTimeJoinDate} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.fullTimeJoinDate === "" ? "!text-[#747681]" : "!text-white"}`} />
                                {formik.errors.fullTimeJoinDate && formik.touched.fullTimeJoinDate && (
                                    <p className={`${errorClasses}`}>
                                        {formik.errors.fullTimeJoinDate}
                                    </p>
                                )}
                            </> : <>
                                <FormInput label="Full Joining Date" name="date" type="date" placeholder="mm/dd/yyyy" value={formik.values.date} readOnly onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.date === "" ? "!text-[#747681]" : "!text-white"}`} />
                                {formik.errors.date && formik.touched.date && (
                                    <p className={`${errorClasses}`}>
                                        {formik.errors.fullTimeJoinDate}
                                    </p>
                                )}
                            </>
                        }
                    </div>
                    <div className="relative">
                        {!isEditLastIncreamentDate ?
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editIncreamentDate}>Edit</Button> :
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editIncreamentDate}>Cancel</Button>
                        }
                        {isEditLastIncreamentDate ?
                            <>
                                <FormInput label="Increament Date" name="lastIncreamentDate" type="date" placeholder="mm/dd/yyyy" value={formik.values.lastIncreamentDate} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.lastIncreamentDate === "" ? "!text-[#747681]" : "!text-white"}`} />
                                {formik.errors.lastIncreamentDate && formik.touched.lastIncreamentDate && (
                                    <p className={`${errorClasses}`}>
                                        {formik.errors.lastIncreamentDate}
                                    </p>
                                )}
                            </> : <>
                                <FormInput label="Increament Date" name="date" type="date" placeholder="mm/dd/yyyy" value={editingEmployee ? latestIncreament?.increamentDate : formik.values.date} readOnly onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.date === "" ? "!text-[#747681]" : "!text-white"}`} />
                                {formik.errors.date && formik.touched.date && (
                                    <p className={`${errorClasses}`}>
                                        {formik.errors.date}
                                    </p>
                                )}
                            </>
                        }
                    </div>
                    <div className="relative">
                        <FormInput label="Increament Id"
                            type="text"
                            id="lastIncreamentId"
                            name="lastIncreamentId"
                            value={formik.values.lastIncreamentId}
                            onChange={(e) => {
                                formik.handleChange(e);
                                clearError();
                            }}
                            readOnly
                            placeholder="Increament Id" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />

                    </div>

                    <div className="relative">
                        <FormInput type="number" label="Initial Base Salary" name="initialBaseSalary" value={formik.values.initialBaseSalary} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="50000" inputClassName={`${inputStyles}`} />
                        {formik.errors.initialBaseSalary && formik.touched.initialBaseSalary && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.initialBaseSalary}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        {!isEditClick ?
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editCurrentBaseSalary}>Edit</Button>
                            :
                            <Button type="button" buttonClasses="absolute right-0 top-2.5 text-white text-sm" onClick={editCurrentBaseSalary}>Cancel</Button>
                        }
                        {isEditClick ?
                            <>
                                <FormInput type="number" label="Current Base Salary" name="currentBaseSalary" value={formik.values.currentBaseSalary} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="50000" inputClassName={`${inputStyles}`} />


                                {formik.errors.currentBaseSalary && formik.touched.currentBaseSalary && (
                                    <p className={`${errorClasses}`}>
                                        {formik.errors.currentBaseSalary}
                                    </p>
                                )}
                            </> : <>
                                <FormInput type="number" label="Current Base Salary" name="currentBaseSalary" value={formik.values.initialBaseSalary} readOnly onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} placeholder="50000" inputClassName={`${inputStyles}`} />
                                {formik.errors.currentBaseSalary && formik.touched.currentBaseSalary && (
                                    <p className={`${errorClasses}`}>
                                        {formik.errors.currentBaseSalary}
                                    </p>
                                )}
                            </>}
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
                                selectClassName={`${inputStyles} ${bankName === "Select the bank" ? "!text-[#747681]" : "!text-white"} cursor-pointer w-full justify-between`}
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
                                                buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
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
                    <div>
                        <label className={`${labelStyles}`}>
                            Additional Roles
                        </label>
                        <div className="flex gap-4 flex-wrap mt-3.5">
                            {additionalRoles.map((item, index) => (
                                <label key={index} className={`containerCheckMarkMarket`}>
                                    {item}
                                    <input
                                        type="checkbox"
                                        checked={formik.values.additionalRoles.includes(item)}
                                    />
                                    <span className="checkmarkMarket"></span>
                                </label>
                            ))}
                        </div>

                    </div>
                </div>
                <Button type="submit" disabled={editingEmployee ? !formik.dirty : false} buttonClasses={`min-h-10 lg:min-h-[64px] border border-[#CDD6D7] border-solid bg-[#283573] py-3 px-2 lg:py-5 lg:px-[75px] rounded-[15px] flex mx-auto lg:mx-0 mt-4 md:mt-[58px] text-base md:text-lg lg:text-2xl font-semibold lg:leading-[160%] font-urbanist text-white min-w-[200px] lg:min-w-auto w-fit ${editingEmployee && !formik.dirty ? 'opacity-50 !cursor-not-allowed' : 'opacity-1 !cursor-pointer'}`}>
                    {editingEmployee ? 'Update' : 'Register'}
                </Button>
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
