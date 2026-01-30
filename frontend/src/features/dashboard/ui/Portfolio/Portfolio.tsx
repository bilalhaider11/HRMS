import { useEffect, useState } from "react";
import PortfolioChart from "./PortfolioChart";
import { fetchPortfolioData, PortfolioData, Minute } from "../../api/dashboard";
import Box from "../../../../shared/Box";
import useIntersectionObserver from "../../../../shared/UseIntersectionObserver";
import { animate } from "framer-motion";
import Button from "../../../../shared/Button";

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null
  );
  const [activeTime, setActiveTime] = useState<string>("24H");

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const data = await fetchPortfolioData();
        setPortfolioData(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadPortfolioData();
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
      <Box
        ref={ref}
        boxMainDivClasses={`!mt-8 lg:!mt-[72px] transition-all duration-500 ${
          hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        boxClass="pb-5 md:!pb-10"
      >
        <div className="p-5 md:p-10 flex justify-between items-start gap-2.5 flex-wrap">
          <div>
            <h3
              className={`text-lg leading-normal  md:text-[25px] md:leading-10 font-medium font-inter text-white transition-all duration-500 delay-200 ${
                hasAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Portfolio
            </h3>
            <p className="mt-2.5 text-white text-2xl leadin-normal md:text-[35px] font-poppins md:leading-[50px] font-semibold">
              $
              {portfolioData ? (
                <AnimatedNumbers
                  value={
                    portfolioData.minutes.find(
                      (item: Minute) => item.timeValue === activeTime
                    )?.value || 0
                  }
                  index={0}
                  animatedStatsIndexes={animatedStatsIndexes}
                  setAnimatedStatsIndexes={setAnimatedStatsIndexes}
                  shouldAnimate={hasAnimated}
                />
              ) : (
                "0.00"
              )}
              &nbsp;
              <span className="font-inter text-base md:text-xl font-medium text-[#ADDC7B]">
                {portfolioData
                  ? `${
                      portfolioData.minutes.find(
                        (item: Minute) => item.timeValue === activeTime
                      )?.value_progress_percentage
                    }%`
                  : "+0.00%"}
              </span>
            </p>
          </div>
          <div
            className={`flex items-center gap-2.5 flex-wrap transition-all duration-500 delay-300 ${
              hasAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {portfolioData &&
              portfolioData.minutes.map((values: Minute, index: number) => {
                const isActive = activeTime === values.timeValue;
                return (
                  <div
                    key={index}
                    className={`transition-all duration-500 delay-300 ${
                      hasAnimated
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1"
                    }`}
                  >
                    <Button
                      type="button"
                      onClick={() => setActiveTime(values.timeValue)}
                      buttonClasses={`px-[15px] flex items-center justify-center py-1 text-xs md:text-[15px] font-inter font-medium leading-normal h-6 md:h-[30px] pt-[5px] rounded-[15px] ${
                        isActive
                          ? "bg-white text-[#292D3F]"
                          : "bg-[#FFFFFF14] text-white"
                      }`}
                    >
                      {values.timeValue}
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
        <PortfolioChart activeTime={activeTime} />
      </Box>
    </>
  );
};

export default Portfolio;
