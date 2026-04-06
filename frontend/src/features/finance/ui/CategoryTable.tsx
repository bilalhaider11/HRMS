import Box from "../../../shared/Box"
import Button from "../../../shared/Button"
import { useCallback, useEffect, useRef, useState } from "react"
import { useFinance, FinanceCategoriesData } from "../modal/FinanceContext"
import { useNavigate } from "react-router-dom"
import DeleteModal from "../../../shared/DeleteModal"
import Pagination from "../../../shared/Pagination"
import Select from "../../../shared/Select"
import itemsSelectArrow from "../../../assets/images/itemsSelectArrow.svg"
import { updateFinanceCategory } from "../api/financeApi"

const CategoryTable = () => {
    const { financeCategoriesList, isDeleteCategoryModal, setIsDeleteCategoryModal, handleCategoryDelete, updateFinanceCategory: updateCategoryCtx } = useFinance()
    const tableDataClassName = "py-4 px-4 text-sm text-slate-200 font-inter w-[17.5%] truncate"
    const tableHeadingClassName = "py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter w-[17.5%]"

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
    const deleteModalClose = useCallback(() => {
        setIsDeleteCategoryModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }, [setIsDeleteCategoryModal])
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
                        <thead className="bg-slate-800/50">
                            <tr className="border-b border-slate-700">
                                <th className={`${tableHeadingClassName} w-[30%]`}>
                                    Category Id
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Category Name
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Color Code
                                </th>
                                <th className={`${tableHeadingClassName}`}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTableData.map((data: FinanceCategoriesData, index: number) => (
                                <tr key={index}>
                                    <td className={`${tableDataClassName} w-[30%]`}>
                                        {data.id}
                                    </td>

                                    <td className={`${tableDataClassName}`}>
                                        {data.name}
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full inline-block border-2 border-slate-600 flex-shrink-0" style={{ backgroundColor: data.colorCode }} />
                                            <input
                                                type="text"
                                                defaultValue={data.colorCode || ""}
                                                key={data.colorCode}
                                                placeholder="#000000"
                                                onBlur={async (e) => {
                                                    const val = e.target.value.trim();
                                                    if (val && /^#[0-9A-Fa-f]{6}$/.test(val) && val !== data.colorCode) {
                                                        try {
                                                            await updateFinanceCategory(parseInt(data.id || "0"), data.name || "", val);
                                                            updateCategoryCtx({ ...data, colorCode: val });
                                                        } catch (err) {
                                                            console.error("Failed to update color:", err);
                                                        }
                                                    }
                                                }}
                                                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                                className="bg-transparent text-slate-400 text-xs font-inter w-20 outline-none border-b border-transparent focus:border-slate-600 transition-colors"
                                            />
                                        </div>
                                    </td>
                                    <td className={`${tableDataClassName}`}>
                                        <div className="flex items-center h-full w-full justify-end gap-4">
                                            <Button onClick={() => handleCategoryUpdate(data)} type="button" buttonClasses="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-inter">
                                                Update
                                            </Button>
                                            <Button onClick={() => handleDeleteCategory(data)} type="button" buttonClasses="text-sm px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-inter">
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
                    <div className="flex flex-wrap items-center p-4 md:p-6 justify-end border-t border-solid border-slate-800 gap-3 md:gap-[79px]">
                        <p className="text-xs md:text-lg font-medium font-inter text-slate-400 flex gap-3 md:gap-[39px] items-center">
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
                                                className="border-b border-solid border-slate-800 px-5 py-2.5"
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
                            <p className="text-xs md:text-lg font-medium font-inter text-slate-400">
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
                        <p className="text-xl font-poppins text-slate-200">
                            Category Id: <span className="font-bold">{isDeleteCategoryModal.id}</span>
                        </p>
                        <p className="text-xl font-poppins text-slate-200">
                            Category Name: <span className="font-bold">{isDeleteCategoryModal.name}</span>
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