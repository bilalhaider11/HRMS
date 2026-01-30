import { useEffect, useRef, useState } from "react";
import selectArrow from "../../../../assets/images/selectBoxArrow.svg";
import LineChart from "./MarketStatsChart";
import { fetchMarketStatsData, MarketStatsData, Token } from "../../api/dashboard";
import Box from "../../../../shared/Box";
import Select from "../../../../shared/Select";
import useIntersectionObserver from "../../../../shared/UseIntersectionObserver";
import { motion, animate } from "framer-motion";
import Button from "../../../../shared/Button";

const MarketStats = () => {
  const [allStatsData, setAllStatsData] = useState<MarketStatsData | null>(
    null
  );

  const [selectTokensOpen, setSelectTokensOpen] = useState(false);
  const [selectDays, setSelectDays] = useState(false);

  const itemsPerPageOptions = ["AAVE", "UNI", "DOGE", "XTZ"];
  const daysOptions = ["Weekly (2020)", "Yearly"];

  const modalRef = useRef<HTMLDivElement>(null);

  const openTokensDropdown = () => {
    setSelectTokensOpen(!selectTokensOpen);
  };

  const openDaysDropdown = () => {
    setSelectDays(!selectDays);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setSelectTokensOpen(false);
        setSelectDays(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadMarketStatsData = async () => {
      try {
        const data = await fetchMarketStatsData();
        setAllStatsData(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadMarketStatsData();
  }, []);

  console.log(allStatsData);

  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 }) as [
    React.RefObject<HTMLDivElement>,
    boolean
  ];
  const [refStats, isVisibleStats] = useIntersectionObserver({
    threshold: 0.1,
  }) as [React.RefObject<HTMLDivElement>, boolean];
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [hasAnimatedStats, setHasAnimatedStats] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated]);

  useEffect(() => {
    if (isVisibleStats && !hasAnimatedStats) {
      setHasAnimatedStats(true);
    }
  }, [isVisibleStats, hasAnimatedStats]);
  const [animatedStatsIndexes, setAnimatedStatsIndexes] = useState<number[]>(
    []
  );

  const AnimatedNumbers = ({
    value,
    index,
    animatedStatsIndexes,
    setAnimatedStatsIndexes,
    shouldAnimate,
  }: {
    value: string | number;
    index: number;
    animatedStatsIndexes: number[];
    setAnimatedStatsIndexes: React.Dispatch<React.SetStateAction<number[]>>;
    shouldAnimate: boolean;
  }) => {
    const [displayValue, setDisplayValue] = useState(0);

    const cleanedValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^0-9.-]/g, ""))
        : Number(value);

    useEffect(() => {
      if (animatedStatsIndexes.includes(index)) {
        setDisplayValue(Math.round(cleanedValue));
        return;
      }

      if (shouldAnimate) {
        const controls = animate(0, cleanedValue, {
          duration: 1.5,
          onUpdate(latest) {
            setDisplayValue(Math.round(latest));
          },
          onComplete() {
            // Add index to animated list
            setAnimatedStatsIndexes((prev) => [...prev, index]);
          },
        });

        return () => controls.stop();
      }
    }, [cleanedValue, shouldAnimate, index, animatedStatsIndexes]);

    return <span>{displayValue.toLocaleString()}</span>;
  };

  return (
    <>
      <div className="mt-8 flex flex-col lg:flex-row gap-8 justify-between">
        <Box
          ref={ref}
          boxMainDivClasses={`w-full lg:!w-[74.3%] transition-all duration-500 ${
            hasAnimated
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          boxClass="p-5 md:!p-8"
        >
          <div className="flex justify-between items-center flex-wrap gap-3 mb-20">
            <div
              className={`transition-all duration-500 delay-100 ${
                hasAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <h3 className="font-poppins font-medium text-lg md:text-[21px] leading-normal text-white">
                Market Overview
              </h3>
              <p
                className={`font-poppins font-normal text-[10px] md:text-[13px] leading-normal text-white mt-1 md:mt-[7px] transition-all duration-500 delay-200 ${
                  hasAnimated
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Lorem ipsum dolor sit amet, consectetur
              </p>
            </div>
            <div
              className={`flex flex-wrap gap-5 md:flex-nowrap md:gap-[29px] items-center transition-all duration-500 delay-500 ${
                hasAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {allStatsData &&
                allStatsData.tokens.map((token: Token, index: number) => (
                  <div key={index}>
                    <label className="containerCheckMarkMarket font-poppins text-xs md:text-[17px] text-white font-medium leading-normal">
                      {token.tokenName}
                      <input type="checkbox" />
                      <span className="checkmarkMarket"></span>
                    </label>
                  </div>
                ))}
            </div>
            <div
              className={`flex gap-4 flex-wrap transition-all duration-500 delay-1000 ${
                hasAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="relative" ref={modalRef}>
                <Select
                  onClick={openTokensDropdown}
                  selectClassName="flex items-center justify-between !w-[186px] !h-12 md:!h-[52px] !p-2.5 !py-0 md:!px-[18px] md:!pt-[17px] !cursor-pointer md:!pb-[13px] !bg-transparent !border !border-solid !border-white !text-white text-xs md:!text-[15px] !font-medium !font-poppins !rounded-[15px]"
                  children="More tokens"
                  selectArrowClassName={`${
                    selectTokensOpen ? "-rotate-[180deg]" : "rotate-0"
                  } transition-all`}
                  selectArrowPath={selectArrow}
                />
                {selectTokensOpen && (
                  <div className="bodyBackground absolute top-[50px] md:top-[65px] rounded-[15px] overflow-hidden shadow-xl right-0 w-full z-[9999]">
                    <ul>
                      {itemsPerPageOptions.map((item, index) => (
                        <li key={index} className="w-full">
                          <Button
                            type="button"
                            buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
                          >
                            {item}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative" ref={modalRef}>
                <Select
                  onClick={openDaysDropdown}
                  selectClassName="flex items-center justify-between !w-[186px] !h-12 md:!h-[52px] !p-2.5 !py-0 md:!px-[18px] md:!pt-[17px] !cursor-pointer md:!pb-[13px] !bg-transparent !border !border-solid !border-white !text-white text-xs md:!text-[15px] !font-medium !font-poppins !rounded-[15px]"
                  children="Weekly (2020)"
                  selectArrowClassName={`${
                    selectDays ? "-rotate-[180deg]" : "rotate-0"
                  } transition-all`}
                  selectArrowPath={selectArrow}
                />
                {selectDays && (
                  <div className="bodyBackground absolute top-[50px] md:top-[65px] rounded-[15px] overflow-hidden shadow-xl right-0 w-full z-90">
                    <ul>
                      {daysOptions.map((item, index) => (
                        <li key={index} className="w-full">
                          <Button
                            type="button"
                            buttonClasses="border-b border-solid border-[#FFFFFF21] px-5 py-2.5 text-white text-sm w-full text-left hover:opacity-[0.4] transition-all"
                          >
                            {item}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <LineChart />
        </Box>

        <Box
          boxMainDivClasses={`w-full lg:!w-[23%] !min-w-full lg:!min-w-[367px] transition-all duration-500 ${
            hasAnimatedStats
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          boxClass="p-5 md:!p-8"
          ref={refStats}
        >
          <h3
            className={`transition-all duration-500 delay-100 font-poppins font-medium text-lg md:text-[21px] leading-normal text-white ${
              hasAnimatedStats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Basic Statistics
          </h3>
          <div className="flex flex-wrap lg:block items-center justify-center md:justify-between gap-5 mt-[70px] lg:mt-0">
            <div className="lg:mt-[70px] flex justify-center">
              <div className="progress-wrapper">
                {allStatsData &&
                  allStatsData.basisStatistics.map(
                    (stat: any, index: number) => (
                      <div key={index} className="half-ring">
                        <svg viewBox="0 0 300 150">
                          <path
                            className="bg"
                            d={`M${stat.startX},150 A${stat.radius},${stat.radius} 0 0,1 ${stat.endX},150`}
                          />
                          <motion.path
                            className="fg"
                            d={`M${stat.startX},150 A${stat.radius},${stat.radius} 0 0,1 ${stat.endX},150`}
                            stroke={stat.color}
                            strokeWidth="14"
                            strokeDasharray={stat.dashArray}
                            initial={{ strokeDashoffset: stat.dashArray }}
                            animate={{
                              strokeDashoffset: hasAnimatedStats
                                ? stat.dashArray -
                                  (stat.dashArray * stat.progress) / 100
                                : stat.dashArray,
                            }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                          />
                        </svg>
                      </div>
                    )
                  )}
              </div>
            </div>
            <div className="mt-0 lg:mt-[58px] md:w-auto w-full">
              {allStatsData &&
                allStatsData.basisStatistics.map(
                  (basicStats: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center gap-2 mb-3.5"
                    >
                      <div
                        className={`flex gap-[11px] items-center transition-all duration-500 delay-500 ${
                          hasAnimatedStats
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: basicStats.color }}
                        ></div>
                        <h4 className="font-poppins font-normal leading-normal line-clamp-1 text-xs md:text-[15px] text-white">
                          {basicStats.title}
                        </h4>
                      </div>
                      <p className="font-poppins font-semibold text-xs md:text-[17px] text-white leading-normal">
                        $
                        <AnimatedNumbers
                          value={basicStats.value}
                          index={index}
                          animatedStatsIndexes={animatedStatsIndexes}
                          setAnimatedStatsIndexes={setAnimatedStatsIndexes}
                          shouldAnimate={hasAnimatedStats}
                        />
                      </p>
                    </div>
                  )
                )}
            </div>
          </div>
        </Box>
      </div>
    </>
  );
};

export default MarketStats;
