import Box from "../../../shared/Box"
import Button from "../../../shared/Button"
import { useCallback, useEffect, useRef, useState } from "react"
import { useFinance, FinanceCategoriesData } from "../modal/FinanceContext"
import { useNavigate } from "react-router-dom"
import DeleteModal from "../../../shared/DeleteModal"
import Pagination from "../../../shared/Pagination"
import Select from "../../../shared/Select"
import itemsSelectArrow from "../../../assets/images/itemsSelectArrow.svg"

const CategoryTable = () => {
    const { financeCategoriesList, isDeleteCategoryModal, setIsDeleteCategoryModal, handleCategoryDelete } = useFinance()
    const tableDataClassName = "py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-white w-[17.5%] pl-3 pr-10 text-right truncate"
    const tableHeadingClassName = "whitespace-nowrap py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[17.5%] pl-3 pr-10 text-right"

    const navigate = useNavigate()
    const [allTableData, setAllTableData] = useState<FinanceCategoriesData[]>([]);
    const [selectItemsNumber, setSelectItemsNumber] = useState(false);

    const [itemValue, setItemValue] = useState(10);
    const itemsPerPageOptions = allTableData.length > 0
        ? [10, 20, 30, allTableData.length]
        : [10, 20, 30];


    const handleCategoryUpdate = (cate: FinanceCategoriesData) => {
        navigate(`/finance/category-lists/update-category/${cate.id}`);
    }

    const deleteModalRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleDeleteCategory = (category: FinanceCategoriesData) => {
        setIsDeleteCategoryModal(category)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }
    const deleteModalClose = () => {
        setIsDeleteCategoryModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    const selectItemButton = useCallback(() => {
        setSelectItemsNumber(!selectItemsNumber);
    }, [selectItemsNumber]);

    const selectingTheItem = (item: number) => {
        setItemValue(item);
        setPostsPerPage(item);
        setSelectItemsNumber(!selectItemsNumber);
    };

    useEffect(() => {
        setAllTableData(financeCategoriesList);
    }, [financeCategoriesList]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                deleteModalRef.current &&
                !deleteModalRef.current.contains(event.target as Node)
            ) {
                deleteModalClose()
            }
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                selectItemsNumber
            ) {
                selectItemButton();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectItemsNumber, selectItemButton, deleteModalClose]);



    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);

    const tableLastPage = currentPage * postsPerPage;
    const tableFirstPage = tableLastPage - postsPerPage;

    const currentTableData = allTableData
        ? allTableData.slice(tableFirstPage, tableLastPage)
        : [];

    return (
        <>
            <Box
                boxMainDivClasses={` mt-[30px] transition-all duration-500 delay-300`}
            >
                <div className="w-full overflowXAuto">
                    <table className="w-full min-w-[1024px]">
                        <thead>
                            <tr className="">
                                <th className={`${tableHeadingClassName} !w-[30%] !text-left !pl-10 !pr-3`}>
                                    Category Id
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Category Name
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Color Code
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Company Id
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTableData.map((data: FinanceCategoriesData, index: number) => (
                                <tr key={index}>
                                    <td className={`${tableDataClassName} !w-[30%] !text-left !pl-10 !pr-3`}>
                                        {data.id}
                                    </td>

                                    <td className={`${tableDataClassName}`}>
                                        {data.name}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        {data.colorCode}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        {data.companyId}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        <div className="flex items-center h-full w-full justify-end gap-4">
                                            <Button onClick={() => handleCategoryUpdate(data)} type="button" buttonClasses="bodyBackground px-4 py-3 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
                                                Update
                                            </Button>
                                            <Button onClick={() => handleDeleteCategory(data)} type="button" buttonClasses="bodyBackground px-4 py-3 font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap rounded-[15px]">
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {allTableData && (
                    <div className="flex flex-wrap items-center p-4 md:p-6 justify-end border-t border-solid border-[#FFFFFF21] gap-3 md:gap-[79px]">
                        <p className="text-xs md:text-lg font-medium font-inter text-[#FFFFFF7A] flex gap-3 md:gap-[39px] items-center">
                            Items per Page
                            <div className="relative" ref={modalRef}>
                                <Select
                                    onClick={selectItemButton}
                                    children={itemValue}
                                    selectArrowClassName={`${selectItemsNumber ? "-rotate-[180deg]" : "rotate-0"
                                        } transition-all`}
                                    selectArrowPath={itemsSelectArrow}
                                />
                                <div
                                    className={`bodyBackground absolute bottom-10 rounded-[15px] overflow-hidden shadow-xl right-0 ${selectItemsNumber ? "block" : "hidden"
                                        }`}
                                >
                                    <ul>
                                        {itemsPerPageOptions.map((item, index) => (
                                            <li
                                                key={index}
                                                className="border-b border-solid border-[#FFFFFF21] px-5 py-2.5"
                                            >
                                                <Button
                                                    type="button"
                                                    onClick={() => selectingTheItem(item)}
                                                >
                                                    {item}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </p>
                        <div className="flex items-center gap-5">
                            <p className="text-xs md:text-lg font-medium font-inter text-[#FFFFFF7A]">
                                {`${tableFirstPage + 1}-${Math.min(
                                    tableLastPage,
                                    allTableData.length
                                )}`}{" "}
                                of {allTableData.length}
                            </p>

                            <Pagination
                                postsPerPage={postsPerPage}
                                totalPosts={allTableData.length}
                                currentPageSet={setCurrentPage}
                                currentPage={currentPage}
                            />
                        </div>
                    </div>
                )}
            </Box>
            {isDeleteCategoryModal &&
                <DeleteModal ref={deleteModalRef} closeButtonCLick={deleteModalClose}>
                    <h1 className="text-2xl text-center font-urbanist leading-[150%] text-white border-b border-solid border-[#CDD6D7] p-6 mb-8">Delete Finance</h1>
                    <div className="flex flex-col gap-4 px-5 mb-5">
                        <p className="text-xl font-poppins text-white">
                            Category Id: <span className="font-bold">{isDeleteCategoryModal.id}</span>
                        </p>
                        <p className="text-xl font-poppins text-white">
                            Category Name: <span className="font-bold">{isDeleteCategoryModal.name}</span>
                        </p>
                        <p className="text-xl font-poppins text-white">
                            Company Id: <span className="font-bold">{isDeleteCategoryModal.companyId}</span>
                        </p>

                    </div>

                    <div className="border-t border-solid border-[#CDD6D7] py-6 px-5 flex justify-center">

                        <Button onClick={() => handleCategoryDelete(isDeleteCategoryModal)} buttonClasses="flex justify-center mx-auto min-h-[64px] px-11 pb-[15px] pt-4 border border-solid border-[#CDD6D7] bg-[#283573] font-urbanist font-semibold text-xl leading-[160%] rounded-[15px] text-white" type="button">
                            Confirm Delete
                        </Button>
                    </div>
                </DeleteModal>
            }
        </>
    )
}

export default CategoryTable