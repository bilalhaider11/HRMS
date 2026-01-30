import FormInput from "../../../shared/FormInputs"
import * as Yup from "yup";
import { useFormik } from "formik";
import Button from "../../../shared/Button";
import { FinanceTableData } from "../modal/FinanceContext";
import { useFinance, FinanceCategoriesData } from "../modal/FinanceContext";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useState } from "react";
import Select from "../../../shared/Select";
import SuccessfullModal from "../../../shared/SuccessfullModal";
import { useNavigate } from "react-router-dom";
import itemsSelectArrow from "../../../assets/images/itemsSelectArrow.svg"



const formSchema = Yup.object().shape({
    date: Yup.string().required("Date is required"),
    amount: Yup.number().required("Amount is required").positive("Amount must be positive"),
    chequeNumber: Yup.string().required("Cheque Number is required"),
    addedBy: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    categoryId: Yup.string().required("Category is required")
});

const taxRate = 5;

const Form = () => {

    const { addFinance, clearError, idExistError, successfullModal, setSuccessfullModal, setEditingFinance, editingFinance, updateFinance, financeCategoriesList, financeList } = useFinance();
    const labelStyles = "font-urbanist font-semibold text-base md:text-lg lg:text-[21px] lg:leading-[180%] text-white"
    const inputBorder = "inputMainBorder mt-3.5 w-full rounded-[8px]"
    const inputStyles = "inputBox text-sm md:text-base leading-normal px-4 py-2.5 lg:py-[21px] lg:px-[29px] rounded-[15px] text-white placeholder-[#747681]"
    const errorClasses = "text-red-500 text-xs mt-1 absolute -bottom-6"
    const navigate = useNavigate()

    const [generatedFinanceId] = useState<string>(uuidv4());
    const [selectTheCategory, setSelectTheCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Select the Category")
    const [categoryId, setCategoryId] = useState("")

    const handleSubmit = (values: any) => {
        console.log(editingFinance)
        if (editingFinance !== null && updateFinance) {
            const updatedFinance = {
                ...editingFinance,
                ...values,
                Amount: parseFloat(values.amount.toString()) || 0,
                TaxDeductions: calculatedFinal,
                CategoryID: values.categoryId || categoryId,
            };
            updateFinance(updatedFinance);
            formik.resetForm();
        } else {
            const newFinance: FinanceTableData = {
                FinanceId: values.financeId,
                Date: values.date,
                Amount: parseFloat(values.amount) || 0,
                ChequeNumber: values.chequeNumber,
                AddedBy: values.addedBy,
                TaxDeductions: calculatedFinal,
                Description: values.description,
                CategoryID: values.categoryId || undefined,
                CompanyID: values.companyId
            }
            const added = addFinance(newFinance);
            console.log(added)
            if (added) {
                formik.resetForm();
            }
        }
    }


    const formik = useFormik({
        initialValues: {
            financeId: editingFinance?.FinanceId || generatedFinanceId,
            date: editingFinance?.Date || "",
            amount: editingFinance?.Amount || "",
            chequeNumber: editingFinance?.ChequeNumber || "",
            addedBy: editingFinance?.AddedBy || "",
            description: editingFinance?.Description || "",
            taxDeductions: editingFinance?.TaxDeductions || "",
            categoryId: editingFinance?.CategoryID || "",
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    const numericAmount = parseFloat(formik.values.amount.toString()) || 0;
    const calculatedTax = numericAmount * taxRate;
    const calculatedFinal = calculatedTax / 100;


    const successfullyAdded = () => {
        setEditingFinance(null)
        setSuccessfullModal(false)
        navigate('/finance')
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    const selectCategory = useCallback(() => {
        setSelectTheCategory(!selectTheCategory);
    }, [selectTheCategory]);

    useEffect(() => {
        if (financeCategoriesList.length > 0) {
            const foundCategorySelected = financeCategoriesList.find((fin) => fin.id?.toString() === editingFinance?.CategoryID?.toString())
            if (foundCategorySelected) {
                setCategoryId(foundCategorySelected.id?.toString() || "")
                setSelectedCategory(foundCategorySelected.name || "Select the Category")
            } else {
                console.log("id not found", foundCategorySelected)
            }
        }

    }, [editingFinance, financeCategoriesList])

    const selectingTheCategory = (item: FinanceCategoriesData) => {
        setSelectedCategory(item.name || selectedCategory);
        setCategoryId(item.id?.toString() || "")
        formik.setFieldValue('categoryId', item.id?.toString() || "")
        setSelectTheCategory(!selectTheCategory);
    }

    return (
        <>
            <form onSubmit={formik.handleSubmit} noValidate>
                <div className="grid md:grid-cols-2 gap-3 md:gap-5 lg:gap-[38px]">
                    <div className="relative">
                        <FormInput label="Id"
                            type="text"
                            id="financeId"
                            name="financeId"
                            value={formik.values.financeId}
                            onChange={(e) => {
                                formik.handleChange(e);
                                clearError();
                            }}
                            readOnly
                            placeholder="Finance ID" labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.financeId && formik.touched.financeId && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.financeId}
                            </p>
                        )}

                    </div>
                    <div className="relative">
                        <FormInput label="Date" name="date" type="date" placeholder="mm/dd/yyyy" value={formik.values.date} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles} ${formik.values.date === "" ? "!text-[#747681]" : "!text-white"}`} />
                        {formik.errors.date && formik.touched.date && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.date}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Amount" name="amount" type="number" placeholder="Amount" value={formik.values.amount} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.amount && formik.touched.amount && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.amount}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Tax Deduction" name="taxDeductions" readOnly type="number" placeholder="Tax Deduct.." value={calculatedFinal} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />

                    </div>
                    <div className="relative">
                        <FormInput label="Cheque No" name="chequeNumber" type="text" placeholder="ABC-123" value={formik.values.chequeNumber} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.chequeNumber && formik.touched.chequeNumber && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.chequeNumber}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <FormInput label="Added By" name="addedBy" type="text" placeholder="Ali.." value={formik.values.addedBy} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />
                        {formik.errors.addedBy && formik.touched.addedBy && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.addedBy}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <label className={`${labelStyles}`}>Select Category</label>
                        <div className={`${inputBorder} h-fit`}>
                            <Select
                                onClick={selectCategory}
                                children={selectedCategory}
                                selectClassName={`${inputStyles} ${selectedCategory === "Select the Category" ? "!text-[#747681]" : "!text-white"} cursor-pointer w-full justify-between`}
                                selectArrowClassName={`${selectTheCategory ? "-rotate-[180deg]" : "rotate-0"
                                    } transition-all`}
                                selectArrowPath={itemsSelectArrow}
                            />
                        </div>
                        <div
                            className={`bodyBackground absolute top-[132px] z-[9999] w-full rounded-[15px] overflow-hidden shadow-xl right-0 ${selectTheCategory ? "block" : "hidden"
                                }`}
                        >
                            <ul>
                                {financeCategoriesList.map((item, index) => (
                                    <li
                                        key={index}
                                    >
                                        <Button
                                            type="button"
                                            onClick={() => selectingTheCategory(item)}
                                            buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5 text-white w-full"
                                        >
                                            {item.name}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {formik.errors.categoryId && formik.touched.categoryId && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.categoryId}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <FormInput label="Company Id" name="companyId" type="number" readOnly value={editingFinance?.CompanyID || 101} onChange={formik.handleChange} labelClassName={`${labelStyles}`} inputMainBorder={`${inputBorder}`} inputClassName={`${inputStyles}`} />

                    </div>

                    <div className="relative">
                        <label className={`${labelStyles}`}>Description</label>
                        <div className={`${inputBorder} h-[76%]`}>
                            <textarea
                                className={`${inputStyles} w-full h-[181px] outline-none`}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                name="description"
                            />
                        </div>
                        {formik.errors.description && formik.touched.description && (
                            <p className={`${errorClasses}`}>
                                {formik.errors.description}
                            </p>
                        )}
                    </div>
                </div>

                {idExistError && (
                    <p className={`${errorClasses}`}>
                        {idExistError}
                    </p>
                )}
                <Button type="submit" disabled={editingFinance ? !formik.dirty : false} buttonClasses={`min-h-10 lg:min-h-[64px] border border-[#CDD6D7] border-solid bg-[#283573] py-3 px-2 lg:py-5 lg:px-[75px] rounded-[15px] flex mx-auto lg:mx-0 mt-4 md:mt-[58px] text-base md:text-lg lg:text-2xl font-semibold lg:leading-[160%] font-urbanist text-white min-w-[200px] lg:min-w-auto w-fit ${editingFinance && !formik.dirty ? 'opacity-50 !cursor-not-allowed' : 'opacity-1 !cursor-pointer'}`}>
                    {editingFinance ? 'Update' : 'Register'}
                </Button>
            </form>
            {successfullModal &&
                <SuccessfullModal modalClassName="" modalMain="" successfullOk={successfullyAdded}>
                    {editingFinance ? 'Successfully Updated your Finance.' : 'Successfully Registered your Finance.'}
                </SuccessfullModal>
            }
        </>
    )
}

export default Form
