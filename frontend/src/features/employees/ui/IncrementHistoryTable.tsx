import { useEffect, useRef, useState } from "react";
import Box from "../../../shared/Box";
import Button from "../../../shared/Button";
import { useEmployees, IncrementHistory } from "../modal/EmployeesContext";
import IncrementModalForm from "./IncreamentModalForm";
import DeleteModal from "shared/DeleteModal";


const IncrementHistoryTable = () => {
    const { employeeIncreamentList, editIncreamentList, editingIncreamentList, updateIncrement, handleIncrementDelete, setIsDeleteModal, isDeleteModal } = useEmployees();
    const [updateModal, setUpdateModal] = useState<IncrementHistory | null>(null);

    const updateModalOpen = (incrementData: IncrementHistory) => {
        editIncreamentList(incrementData);
        setUpdateModal(incrementData);
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    };
    const deleteModalRef = useRef<HTMLDivElement>(null);

    const updateModalClose = () => {
        setUpdateModal(null);
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    };


    const deletingModal = (incrementData: IncrementHistory) => {
        setIsDeleteModal(incrementData)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }
    const deleteModalClose = () => {
        setIsDeleteModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                deleteModalRef.current &&
                !deleteModalRef.current.contains(event.target as Node)
            ) {
                deleteModalClose()
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <Box
                boxMainDivClasses={` mt-[30px] transition-all duration-500 delay-300`}
            >
                <div className="w-full overflowXAuto">
                    <table className="w-full min-w-[1024px]">
                        <thead>
                            <tr className="">
                                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[40%] text-left pl-5 md:pl-10 lg:pl-[109px]">
                                    Increment Amount
                                </th>
                                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[30%] pl-3 pr-10 text-right">
                                    Increment Date
                                </th>
                                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[30%] pl-3 pr-10 text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeIncreamentList && employeeIncreamentList.length > 0 && (
                                employeeIncreamentList.map((data, index) => (
                                    <tr key={index}>

                                        <td className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-white w-[40%] text-left pl-5 md:pl-10 lg:pl-[109px]">
                                            {data.increamentAmount}
                                        </td>
                                        <td className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-white w-[30%] pl-3 pr-10 text-right">
                                            {data.increamentDate}
                                        </td>
                                        <td className="py-0 w-[30%] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-white pl-3 pr-10 text-right">
                                            <div className="flex items-center h-full w-full justify-end gap-4">
                                                <Button onClick={() => updateModalOpen(data)} buttonClasses="bodyBackground px-4 py-3 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
                                                    Update
                                                </Button>
                                                <Button onClick={() => deletingModal(data)} buttonClasses="bodyBackground px-4 py-3 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Box>
            {
                updateModal &&
                <IncrementModalForm incrementFieldsData={editingIncreamentList || undefined} updatedIncrement={updateIncrement} closeModal={updateModalClose} />
            }
            {
                isDeleteModal &&
                <DeleteModal ref={deleteModalRef} closeButtonCLick={deleteModalClose}>
                    <h1 className="text-2xl text-center font-urbanist leading-[150%] text-white border-b border-solid border-[#CDD6D7] p-6 mb-8">Delete Increament</h1>
                    <div className="flex flex-col gap-4 px-5 mb-5">
                        <p className="text-xl font-poppins text-white">
                            Increament Id: <span className="font-bold">{isDeleteModal.increamentId}</span>
                        </p>
                        <p className="text-xl font-poppins text-white">
                            Increament Amount: <span className="font-bold">{isDeleteModal.increamentAmount}</span>
                        </p>
                        <p className="text-xl font-poppins text-white">
                            Increament Date: <span className="font-bold">{isDeleteModal.increamentDate}</span>
                        </p>

                    </div>
                    <div className="border-t border-solid border-[#CDD6D7] py-6 px-5 flex justify-center">

                        <Button onClick={() => handleIncrementDelete(isDeleteModal)} buttonClasses="flex justify-center mx-auto min-h-[64px] px-11 pb-[15px] pt-4 border border-solid border-[#CDD6D7] bg-[#283573] font-urbanist font-semibold text-xl leading-[160%] rounded-[15px] text-white" type="button">
                            Confirm Delete
                        </Button>
                    </div>
                </DeleteModal>
            }

        </>
    )
}

export default IncrementHistoryTable
