import tableMenus from "../../../../assets/images/tableMenus.svg";
import tableIcon from "../../../../assets/images/tableIcon.svg";
import cryptoImg from "../../../../assets/images/Crypto.svg";
import btc from "../../../../assets/images/bitcoin.svg";
import aave from "../../../../assets/images/ave.svg";
import doge from "../../../../assets/images/doge.svg";
import uni from "../../../../assets/images/uni.svg";
import itemsSelectArrow from "../../../../assets/images/itemsSelectArrow.svg";
import { useEffect, useRef, useState, useCallback } from "react";
import Pagination from "../../../../shared/Pagination";
import { fetchHoldingData, HoldingData, TableData } from "../../api/dashboard";
import HoldingChart from "./HoldingsChart";
import Box from "../../../../shared/Box";
import Select from "../../../../shared/Select";
import useIntersectionObserver from "../../../../shared/UseIntersectionObserver";
import ImageButton from "../../../../shared/ImageButton";
import Button from "../../../../shared/Button";

const Holdings = () => {
  const imageMap: { [key: string]: string } = {
    firstDataImg: cryptoImg,
    secondDataImg: btc,
    thirdDataImg: aave,
    fourthDataImg: doge,
    fifthDataImg: uni,
  }; 

  const modalRef = useRef<HTMLDivElement>(null);
  const [allTableData, setAllTableData] = useState<HoldingData | null>(null);
  const [selectItemsNumber, setSelectItemsNumber] = useState(false);
  const [loader, setLoader] = useState(false);
  const [itemValue, setItemValue] = useState(10);
  const itemsPerPageOptions = allTableData
    ? [10, 20, 30, allTableData.tableData.length]
    : [10, 20, 30];

  useEffect(() => {
    setLoader(true);
    const loadHoldingData = async () => {
      try {
        const data = await fetchHoldingData();
        setAllTableData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoader(false);
      }
    };

    loadHoldingData();
  }, []);

  const selectItemButton = useCallback(() => {
    setSelectItemsNumber(!selectItemsNumber);
  }, [selectItemsNumber]);

  const selectingTheItem = (item: number) => {
    setItemValue(item);
    setPostsPerPage(item);
    setSelectItemsNumber(!selectItemsNumber);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  }, [selectItemsNumber, selectItemButton]);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);

  const tableLastPage = currentPage * postsPerPage;
  const tableFirstPage = tableLastPage - postsPerPage;

  const currentTableData = allTableData
    ? allTableData.tableData.slice(tableFirstPage, tableLastPage)
    : [];

  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 }) as [
    React.RefObject<HTMLDivElement>,
    boolean
  ];
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated]);

  return (
    <>
      <div ref={ref} className="my-8 lg:my-[71px]">
        <h3 className={`text-xl sm:text-2xl md:text-[29px] font-medium leading-normal md:leading-11 font-inter mb-6 md:mb-[29px] text-white  transition-all duration-500  ${
                hasAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}>
          My holdings
        </h3>
        <Box boxMainDivClasses={` transition-all duration-500 delay-500  ${
                hasAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}>
          <div className="p-4 md:p-6">
            <div className="flex gap-[19px] justify-end">
              <ImageButton type="button">
                <img src={tableMenus} alt="table" />
              </ImageButton>
              <ImageButton type="button">
                <img src={tableIcon} alt="table" />
              </ImageButton>
            </div>
          </div>
          <div className="w-full overflowXAuto">
            <table className="w-full min-w-[1024px]">
              <thead>
                <tr className="border-t border-solid border-[#FFFFFF21]">
                  <th className="py-3 md:py-[19px] text-base md:text-lg font-inter leading-normal md:leading-[30px] font-medium text-[#FFFFFF7A] w-[56.4%] text-left pl-[100px]">
                    Name
                  </th>
                  <th className="py-3 md:py-[19px] text-base md:text-lg font-inter leading-normal md:leading-[30px] font-medium text-[#FFFFFF7A] w-[10.45%] pl-3 pr-[39px] text-right">
                    Value
                  </th>
                  <th className="py-3 md:py-[19px] text-base md:text-lg font-inter leading-normal md:leading-[30px] font-medium text-[#FFFFFF7A] w-[10.05%] pl-3 pr-[39px] text-right">
                    P/L ($)
                  </th>
                  <th className="py-3 md:py-[19px] text-base md:text-lg font-inter leading-normal md:leading-[30px] font-medium text-[#FFFFFF7A] w-[10.48%] pl-3 pr-[39px] text-right">
                    P/L (%)
                  </th>
                  <th className="py-3 md:py-[19px] text-base md:text-lg font-inter leading-normal md:leading-[30px] font-medium text-[#FFFFFF7A] w-[12.5%] pl-3 pr-[39px] text-right whitespace-nowrap">
                    24H Chart
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTableData &&
                  currentTableData.map((data: TableData, index: number) => (
                    <tr
                      key={index}
                      className="border-t border-solid border-[#FFFFFF21]"
                    >
                      <td className="py-3 md:py-[19px] w-[56.4%] text-left pl-[29px] flex gap-[29px] items-center">
                        <img
                          src={imageMap[data.image]}
                          alt={data.image}
                          className="sm:w-10 sm:h-10 w-[30px] h-[30px]"
                        />
                        <div className="font-inter font-medium text-base sm:text-lg md:text-xl leading-normal text-white whitespace-nowrap">
                          {data.title} &nbsp;
                          <span className="text-[#FFFFFF7A] uppercase">
                            {data.shortTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 md:py-[19px] text-right pl-3 pr-[39px] w-[10.45%] text-base md:text-lg font-medium font-inter text-white">
                        ${data.value}
                      </td>
                      <td
                        className="py-3 md:py-[19px] text-right pl-3 pr-[39px] w-[10.05%] text-base md:text-lg font-medium font-inter"
                        style={{
                          color:
                            data.profit_loss_value > "$50.00"
                              ? "#FF8663"
                              : "#ADDC7B",
                        }}
                      >
                        {data.profit_loss_value}
                      </td>
                      <td
                        className="py-3 md:py-[19px] text-right pl-3 pr-[39px] w-[10.48%] text-base md:text-lg font-medium font-inter"
                        style={{
                          color:
                            data.profit_loss_percentage > "30.00%"
                              ? "#ADDC7B"
                              : "#FF8663",
                        }}
                      >
                        {data.profit_loss_percentage > "30.00%" ? "+" : "-"}
                        {data.profit_loss_percentage}
                      </td>
                      <td className="py-0 text-right pl-3 pr-[39px] w-[12.5%] text-base md:text-lg font-medium font-inter text-white">
                        <HoldingChart holdingData={data} />
                      </td>
                    </tr>
                  ))}
                {loader && (
                  <>
                    <tr className="employeeLoader border-t-[13px] border-[#464980]">
                      <td className="td-1">
                        <span></span>
                      </td>
                      <td className="td-2">
                        <span></span>
                      </td>
                      <td className="td-3">
                        <span></span>
                      </td>
                      <td className="td-4">
                        <span></span>
                      </td>
                      <td className="td-5">
                        <span></span>
                      </td>
                    </tr>
                    <tr className="employeeLoader border-t-[13px] border-[#464980]">
                      <td className="td-1">
                        <span></span>
                      </td>
                      <td className="td-2">
                        <span></span>
                      </td>
                      <td className="td-3">
                        <span></span>
                      </td>
                      <td className="td-4">
                        <span></span>
                      </td>
                      <td className="td-5">
                        <span></span>
                      </td>
                    </tr>
                    <tr className="employeeLoader border-t-[13px] border-[#464980]">
                      <td className="td-1">
                        <span></span>
                      </td>
                      <td className="td-2">
                        <span></span>
                      </td>
                      <td className="td-3">
                        <span></span>
                      </td>
                      <td className="td-4">
                        <span></span>
                      </td>
                      <td className="td-5">
                        <span></span>
                      </td>
                    </tr>
                    <tr className="employeeLoader border-t-[13px] border-[#464980]">
                      <td className="td-1">
                        <span></span>
                      </td>
                      <td className="td-2">
                        <span></span>
                      </td>
                      <td className="td-3">
                        <span></span>
                      </td>
                      <td className="td-4">
                        <span></span>
                      </td>
                      <td className="td-5">
                        <span></span>
                      </td>
                    </tr>
                    <tr className="employeeLoader border-t-[13px] border-[#464980]">
                      <td className="td-1">
                        <span></span>
                      </td>
                      <td className="td-2">
                        <span></span>
                      </td>
                      <td className="td-3">
                        <span></span>
                      </td>
                      <td className="td-4">
                        <span></span>
                      </td>
                      <td className="td-5">
                        <span></span>
                      </td>
                    </tr>
                  </>
                )}
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
                    selectArrowClassName={`${
                      selectItemsNumber ? "-rotate-[180deg]" : "rotate-0"
                    } transition-all`}
                    selectArrowPath={itemsSelectArrow}
                  />
                  <div
                    className={`bodyBackground absolute bottom-10 rounded-[15px] overflow-hidden shadow-xl right-0 ${
                      selectItemsNumber ? "block" : "hidden"
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
                    allTableData.tableData.length
                  )}`}{" "}
                  of {allTableData.tableData.length}
                </p>

                <Pagination
                  postsPerPage={postsPerPage}
                  totalPosts={allTableData.tableData.length}
                  currentPageSet={setCurrentPage}
                  currentPage={currentPage}
                />
              </div>
            </div>
          )}
        </Box>
      </div>
    </>
  );
};

export default Holdings;
