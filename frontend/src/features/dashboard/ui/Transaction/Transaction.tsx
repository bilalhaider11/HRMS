import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchTransactionData,
  TransactionData,
  TransactionTableData,
} from "../../api/dashboard";
import btc from "../../../../assets/images/bitcoin.svg";
import eth from "../../../../assets/images/eth.svg";
import uni from "../../../../assets/images/uni.svg";
import xtz from "../../../../assets/images/xtz.svg";
import itemsSelectArrow from "../../../../assets/images/itemsSelectArrow.svg";
import Pagination from "../../../../shared/Pagination";
import Box from "../../../../shared/Box";
import Select from "../../../../shared/Select";
import useIntersectionObserver from "../../../../shared/UseIntersectionObserver";
import Button from "../../../../shared/Button";

const Transaction = () => {
  const imageMap: { [key: string]: string } = {
    firstCoinImg: btc,
    secondCoinImg: eth,
    thirdCoinImg: uni,
    fourthCoinImg: xtz,
  };
  const sheduleRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [allTransactionTableData, setAllTransactionTableData] =
    useState<TransactionData | null>(null);
  const [selectItemsNumber, setSelectItemsNumber] = useState(false);
  const [sheduleSelect, setSheduleSelect] = useState(false);
  const [itemValue, setItemValue] = useState(10);
  const [sheduleItem, setSheduleItem] = useState("Date & Time");
  const itemsPerPageOptions = allTransactionTableData
    ? [10, 20, 30, allTransactionTableData.transactionTableData.length]
    : [10, 20, 30];
  const sheduleOptions = ["Date & Time", "Weekly"];

  useEffect(() => {
    const loadTransactionData = async () => {
      try {
        const data = await fetchTransactionData();
        setAllTransactionTableData(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadTransactionData();
  }, []);

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

  const selectItemButton = useCallback(() => {
    setSelectItemsNumber(!selectItemsNumber);
  }, [selectItemsNumber]);

  const selectingTheItem = (item: number) => {
    setItemValue(item);
    setPostsPerPage(item);
    setSelectItemsNumber(!selectItemsNumber);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);

  const tableLastPage = currentPage * postsPerPage;
  const tableFirstPage = tableLastPage - postsPerPage;

  const currentTableData = allTransactionTableData
    ? allTransactionTableData.transactionTableData.slice(
        tableFirstPage,
        tableLastPage
      )
    : [];

  const selectShedule = useCallback(() => {
    setSheduleSelect(!sheduleSelect);
  }, [sheduleSelect]);
  const shedulingTheItem = (item: string) => {
    setSheduleItem(item);
    setSheduleSelect(!sheduleSelect);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sheduleRef.current &&
        !sheduleRef.current.contains(event.target as Node) &&
        sheduleSelect
      ) {
        selectShedule();
      }
      if (
        itemsRef.current &&
        !itemsRef.current.contains(event.target as Node) &&
        selectItemsNumber
      ) {
        selectItemButton();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sheduleSelect, selectItemsNumber, selectShedule, selectItemButton]);

  return (
    <div ref={ref} className="my-8 lg:my-[71px]">
      <div className="flex justify-between items-center gap-4 mb-6 md:mb-[29px]">
        <h2
          className={`text-xl sm:text-2xl md:text-[30px] font-medium font-inter leading-normal md:leading-11 text-white  transition-all duration-500 ${
            hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          My transactions
        </h2>
        <Button
          type="button"
          buttonClasses={`outline-none bg-transparent text-[#259DA8] font-inter font-medium text-sm sm:text-base md:text-xl  transition-all duration-500 delay-200 ${
            hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          View All
        </Button>
      </div>

      <Box
        boxMainDivClasses={` transition-all duration-500 delay-300 ${
          hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="w-full overflowXAuto">
          <table className="w-full min-w-[1024px]">
            <thead>
              <tr className="">
                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[48.08%] text-left pl-5 md:pl-10 lg:pl-[109px]">
                  Name
                </th>
                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[8.66%] pl-3 pr-10 text-right">
                  Action
                </th>
                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[13.49%] pl-3 pr-10 text-right relative whitespace-nowrap">
                  <div className="w-full" ref={sheduleRef}>
                    <Select
                      onClick={selectShedule}
                      selectClassName="w-full flex items-center justify-end"
                      children={sheduleItem}
                      selectArrowClassName={`w-[27px] h-[27px] ${
                        sheduleSelect ? "-rotate-[180deg]" : "rotate-0"
                      } transition-all`}
                      selectArrowPath={itemsSelectArrow}
                    />
                  </div>
                  <div
                    className={`bodyBackground absolute -bottom-[100px] right-10 rounded-[15px] shadow-lxl overflow-hidden ${
                      sheduleSelect ? "block" : "hidden"
                    }`}
                  >
                    <ul>
                      {sheduleOptions.map((item, index) => (
                        <li key={index} className="">
                          <Button
                            type="button"
                            buttonClasses="border-b border-solid border-[#FFFFFF21] px-7 py-2.5"
                            onClick={() => shedulingTheItem(item)}
                          >
                            {item}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </th>
                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[9.25%] pl-3 pr-10 text-right">
                  Units
                </th>
                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[11.1%] pl-3 pr-10 text-right">
                  Price
                </th>
                <th className="py-3 md:py-[19px] text-base md:text-lg font-inter font-medium leading-normal md:leading-[30px] text-[#FFFFFF7A] w-[9.56%] pl-3 pr-10 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTableData &&
                currentTableData.map(
                  (data: TransactionTableData, index: number) => (
                    <tr
                      key={index}
                      className="border-t border-solid border-[#FFFFFF21]"
                    >
                      <td className="py-3 md:py-[19px] pl-10 flex items-center w-[48.08%] gap-[17px] sm:gap-[29px]">
                        <img src={imageMap[data.coinImg]} alt="coin-img" className="w-[30px] h-[30px] sm:w-auto sm:h-auto" />
                        <p className="flex items-center gap-2.5 font-inter text-base md:text-xl leading-normal md:leading-[34px] font-medium text-white">
                          {data.title}{" "}
                          <span className="uppercase text-[#FFFFFF7A]">
                            {data.subTitle}
                          </span>
                        </p>
                      </td>
                      <td
                        className={`py-3 md:py-[19px]  pr-10 text-right w-[8.66%]`}
                      >
                        <div
                          className={`rounded-[15px] ml-auto px-[15px] h-6 md:h-[30px] text-xs md:text-[15px] md:leading-6 font-medium font-inter pt-px flex items-center w-fit ${
                            data.actionStatus === "Sell"
                              ? "text-[#FF8663] bg-[#FF866314]"
                              : "text-[#ADDC7B] bg-[#ADDC7B14]"
                          }`}
                        >
                          {data.actionStatus}
                        </div>
                      </td>
                      <td className="py-3 md:py-[19px] text-right pr-10 text-base md:text-lg leading-normal md:leading-[30px] font-medium font-inter text-white w-[13.49%] whitespace-nowrap">
                        {sheduleItem === "Weekly" ? (
                          data.weekly
                        ) : (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: `${data.date}&nbsp;&nbsp;${data.time}`,
                            }}
                          />
                        )}
                      </td>
                      <td className="py-3 md:py-[19px] text-right pr-10 text-base md:text-lg leading-normal md:leading-[30px] font-medium font-inter text-white w-[9.25%] whitespace-nowrap">
                        {data.units}
                      </td>
                      <td className="py-3 md:py-[19px] text-right pr-10 text-base md:text-lg leading-normal md:leading-[30px] font-medium font-inter text-white w-[11.1%] whitespace-nowrap">
                        ${data.price}
                      </td>
                      <td className="py-3 md:py-[19px] text-right pr-10 text-base md:text-lg leading-normal md:leading-[30px] font-medium font-inter text-white w-[9.56%] whitespace-nowrap">
                        ${data.total}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
        {allTransactionTableData && (
          <div className="flex flex-wrap items-center p-4 md:p-6 justify-end border-t border-solid border-[#FFFFFF21] gap-3 md:gap-[79px]gap-[79px]">
            <p className="text-xs md:text-lg font-medium font-inter text-[#FFFFFF7A] flex gap-3 md:gap-[39px] items-center">
              Items per Page
              <div className="relative" ref={itemsRef}>
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
                      <li key={index} className="">
                        <Button
                          type="button"
                          buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5"
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
                  allTransactionTableData.transactionTableData.length
                )}`}{" "}
                of {allTransactionTableData.transactionTableData.length}
              </p>

              <Pagination
                postsPerPage={postsPerPage}
                totalPosts={allTransactionTableData.transactionTableData.length}
                currentPageSet={setCurrentPage}
                currentPage={currentPage}
              />
            </div>
          </div>
        )}
      </Box>
    </div>
  );
};

export default Transaction;
