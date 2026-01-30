import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import ModalsInput from "../../../shared/ModalsInput";
import Button from "../../../shared/Button";
import Modal from "../../../shared/Modal";
import DeleteModal from "../../../shared/DeleteModal";
import { v4 as uuidv4 } from "uuid";

interface IncrementModalFormProps {
    closeModal?: () => void;
    incrementFieldsData?: {
        increamentAmount: number; increamentDate: string
    };
    updatedIncrement?: (data: { increamentAmount: number; increamentDate: string }) => void;
    addIncrement?: (data: { increamentAmount: number; increamentDate: string }) => boolean;
}

const formSchema = Yup.object().shape({
    increamentAmount: Yup.number().required("Increment Amount is required"),
    increamentDate: Yup.string().required("Increment Date is required"),
});

const IncrementModalForm = ({ closeModal, incrementFieldsData, updatedIncrement, addIncrement }: IncrementModalFormProps) => {
    const errorClasses = "text-red-500 text-xs mt-1 absolute -bottom-6"
    const [generatedIncreamentId] = useState<string>(uuidv4())
    
    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                closeModal && closeModal();
            }
        };
        if (closeModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeModal]);
   

    const handleSubmit = (values: any) => {
        if (incrementFieldsData !== null && incrementFieldsData !== undefined) {
            const updateIncrement = {
                ...incrementFieldsData,
                ...values
            }
            updatedIncrement && updatedIncrement(updateIncrement)
            closeModal && closeModal()
        } else {
            addIncrement && addIncrement(values)
            closeModal && closeModal()
        }
    }

    const formik = useFormik({
        initialValues: {
            increamentId: generatedIncreamentId, 
            increamentAmount: incrementFieldsData?.increamentAmount || 0,
            increamentDate: incrementFieldsData?.increamentDate || ''
        },
        validationSchema: formSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    })
    return (
        <>
            <Modal ref={modalRef} closeButtonCLick={closeModal}>
                <h1 className="text-2xl text-center font-urbanist leading-[150%] text-white border-b border-solid border-[#CDD6D7] p-6">Increment {!incrementFieldsData ? "Add" : "Update" }</h1>
                <form onSubmit={formik.handleSubmit} noValidate>
                    <div className="px-6 py-8 flex flex-col gap-5">
                        {
                            !incrementFieldsData &&
                                 <ModalsInput readOnly label="Increment Id" type="string" onChange={formik.handleChange}
                                value={formik.values.increamentId} name="increamentId" />
                        }
                        <div className="relative">
                            <ModalsInput label="Increment Amount" type="number" onChange={formik.handleChange}
                                value={formik.values.increamentAmount} name="increamentAmount" />
                            {formik.errors.increamentAmount && formik.errors.increamentAmount && (
                                <p className={`${errorClasses}`}>
                                    {formik.errors.increamentAmount}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <ModalsInput label="Increment Date" type="date" onChange={formik.handleChange}
                                value={formik.values.increamentDate} name="increamentDate" />
                            {formik.errors.increamentDate && formik.errors.increamentDate && (
                                <p className={`${errorClasses}`}>
                                    {formik.errors.increamentDate}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-solid border-[#CDD6D7] py-6 px-5 flex justify-center">
                        <Button buttonClasses="min-h-[64px] px-11 pb-[15px] pt-4 border border-solid border-[#CDD6D7] bg-[#283573] font-urbanist font-semibold text-xl leading-[160%] rounded-[15px] text-white" type="submit">
                            {incrementFieldsData ? 'Update' : 'Add'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    )
}

export default IncrementModalForm
