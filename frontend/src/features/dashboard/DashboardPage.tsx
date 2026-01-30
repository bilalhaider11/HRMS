import DashboardBody from "./DashboardBody";
import dateFilterIcon from "../../assets/images/dateFilterIcon.svg";
import { useLocation } from "react-router-dom";
import Button from "../../shared/Button";
import { VerifyContext } from "../../app/VerifyContext";
import { useContext } from "react";
// import DashboardSuperAdmin from "./DashboardSuperAdmin";

export default function DashboardPage() {
  const { superAdmin } = useContext(VerifyContext);
  const location = useLocation();
  const state = location?.state;

  console.log(state, "this is state");

  return (
    <>
      {superAdmin ? (
        <div className="mt-5 md:mt-[46px]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white font-poppins leading-normal fade-bottom">
              Dashboard
            </h1>
            <Button
              type="button"
              buttonClasses="bodyBackground fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal min-w-[180px] sm:min-w-[224px] gap-[18px] h-11 sm:h-14 md:h-[73px] text-white"
            >
              <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                <img src={dateFilterIcon} alt="date" className="w-full h-full" />
              </div>
              Filter Periode
            </Button>
          </div>
          <DashboardBody />
          {/* <DashboardSuperAdmin /> */}
        </div>) : (
        <>
        
        </>
      )}
    </>
  );
}
