import { useRef, useEffect, useState } from "react";
import Modal from "../../../shared/Modal"
import { EmployeeTableData, StatusListData } from "../modal/EmployeesContext";
import { useEmployees } from "../modal/EmployeesContext";
import Button from "shared/Button";
interface StatusModalProps {
  closeModal?: () => void,
  statusFromTable?: string,
  employeeId?: string,
  employeeStatus?: EmployeeTableData
  onStatusUpdate?: (id: string, newStatus: string) => void
}
const StatusModal = ({ closeModal, onStatusUpdate, employeeStatus }: StatusModalProps) => {
  const { statusList } = useEmployees();
  const [statusText, setStatusText] = useState(employeeStatus?.status)
  const [disable, setDisable] = useState<string | null>(employeeStatus?.status || null)

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

  const selectStatus = (status: string) => {
    setStatusText(status)
    setDisable(status)
  }


  console.log(statusText)
  return (
    <>
      <Modal ref={modalRef} closeButtonCLick={closeModal}>
        <h1 className="text-2xl text-center font-urbanist font-semibold leading-[150%] border-b border-solid border-[#CDD6D7] text-white p-6 mb-8">Status Modal</h1>
        {statusList?.map((data: StatusListData, index: number) => (
          <div key={index} className="flex flex-col gap-5 pb-8 px-5 max-h-[570px] overflowYAuto">
            {Object.values(data).map((status: string, statusIndex: number) => (
              <Button key={statusIndex} disabled={status === disable} onClick={() => selectStatus(status)} buttonClasses={`border min-h-[64px] border-white outline-none bg-transparent rounded-[15px] p-[18px] text-lg font-inter leading-7 font-semibold text-white transition-all duration-500 ${status === disable ? "opacity-50 !cursor-not-allowed scale-[0.97]" : "opacity-1 !cursor-pointer scale-1"}`}>
                {status}
              </Button>
            ))}
          </div>
        ))}
        <div className="border-t border-solid border-[#CDD6D7] py-6 px-5 flex justify-center">
          <Button buttonClasses="min-h-[64px] px-11 pb-[15px] pt-4 border border-solid border-[#CDD6D7] bg-[#283573] font-urbanist font-semibold text-xl leading-[160%] rounded-[15px] text-white" type="button" onClick={() => {
            if (employeeStatus?.id && onStatusUpdate && statusText) {
              onStatusUpdate(employeeStatus.id, statusText);
            }
            closeModal && closeModal();
          }}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default StatusModal