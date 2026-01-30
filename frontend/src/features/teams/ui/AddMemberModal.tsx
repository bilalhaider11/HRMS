import Modal from "shared/Modal"
import { EmployeeTableData, useTeams } from "../modal/teamsContext"
import { useEffect, useMemo, useRef, useState } from "react";

const AddMemberModal = () => {
    const modalRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { isOpenMembersModal, setIsOpenMembersModal, handleCloseMemberModal, employeeList, selectedMembers, setSelectedMembers } = useTeams()


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {

            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                handleCloseMemberModal
            ) {
                handleCloseMemberModal();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpenMembersModal, handleCloseMemberModal]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return employeeList;
        return employeeList.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employeeList, searchTerm]);

    const handleSelect = (item: EmployeeTableData) => {
        if (!selectedMembers.some(member => member.id === item.id)) {
            setSelectedMembers([...selectedMembers, item]);
        }
        setIsOpen(false);
    }

    return (
        <>
            <Modal ref={modalRef} closeButtonCLick={handleCloseMemberModal} modalClassName="w-full max-w-[600px] min-h-[500px]">
                <h1 className="text-2xl text-center font-urbanist font-semibold leading-[150%] border-b border-solid border-[#CDD6D7] text-white p-6 mb-8">
                    Add Member Modal
                </h1>
                <div className="w-full px-5">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className={`border border-solid border-white bg-transparent h-[46px] outline-none px-4 py-2 rounded-[10px] w-full text-white`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
                    />
                    {isOpen && (
                        <ul className="absolute top-12 h-[150px] overflow-y-auto w-full rounded-[10px] overflow-x-hidden bodyBackground">
                            {filteredItems.map((item) => (
                                <li 
                                    key={item.id} 
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(item);
                                    }}
                                    className="cursor-pointer px-2 py-3 hover:opacity-80 text-base text-white border-b border-solid border-white"
                                >
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-4 justify-between mt-5">
                    {selectedMembers.map((member: EmployeeTableData) => (
                        <div key={member.id} className="bg-white text-black rounded-[10px] p-2">
                            {member.name}
                        </div>
                    ))}
                </div>
                </div>
            </Modal>
        </>
    )
}

export default AddMemberModal