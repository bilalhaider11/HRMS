import profileImg from "../assets/images/profileIcon.svg";
import employeesIcon from "../assets/images/employeesIcon.svg";
import dashBoardIcon from "../assets/images/dashboardIcon.svg";
import departmentsIcon from "../assets/images/departments.svg";
import swapIcon from "../assets/images/swapIcon.svg";
import liquidityIcon from "../assets/images/liquidity.svg";
import companyPolicy from "../assets/images/companyPolicyIcon.svg";
import financeIcon from "../assets/images/finanaceIcon.svg"
import registerIcon from "../assets/images/register.svg"
import settingsIcon from "../assets/images/settingsLogo.svg";
// import settingsIcon from "../assets/images/settingsIcon.svg";
import settingIcon from "../assets/images/settingIcon.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../shared/Button";
import { useLocation } from "react-router-dom";
import ImageButton from "../shared/ImageButton";

interface SideBarProps {
  pathTitle?: string | undefined;
  superAdmin?: boolean;
  name?: string;
  sidebarEmail?: string;
  sideBarLogout?: () => void;
}

export default function SideBar(props: SideBarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState(false);
  const [activeEmpoyees, setActiveEmployees] = useState(false);
  const [activeFinance, setActiveFinance] = useState(false)
  const [activeInventory, setActiveInventory] = useState(false)
  const [activeSettings, setActiveSettings] = useState(false);
  const [activeDepartments, setActiveDepartments] = useState(false);
  const [activePolicy, setActivePolicy] = useState(false);


  const location = useLocation();

  const navigate = useNavigate();

  console.log(props.superAdmin, "super-admin")

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const activeClass = "selectedSideBarOption !font-semibold";

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveDashboard(true);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(false)
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(false);
    } else if (location.pathname === "/settings") {
      setActiveDashboard(false);
      setActiveEmployees(false);
      setActiveSettings(true);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(false)
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(false);
    } else if (
      location.pathname === "/employees" ||
      location.pathname.startsWith("/employee")
    ) {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(true);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(false)
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(false);
    } else if (
      location.pathname === "/finance" ||
      location.pathname.startsWith("/finance")
    ) {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(true)
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(false);
    } else if (
      location.pathname === "/inventory" ||
      location.pathname.startsWith("/inventory")
    ) {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(false)
      setActiveInventory(true)
      // setLeaves(false);
      // setLoan(false);
    } else if (
      location.pathname === "/teams" ||
      location.pathname.startsWith("/teams")
    ) {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveFinance(false)
      setActiveDepartments(true);
      setActivePolicy(false);
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(false);
    } else if (location.pathname === "/policy") {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveDepartments(false);
      setActivePolicy(true);
      setActiveFinance(false)
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(false);
    } else if (location.pathname === "/leaves") {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(false)
      setActiveInventory(false)
      // setLeaves(true);
      // setLoan(false);
    } else if (location.pathname === "/loan") {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(false)
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(true);
    } else {
      setActiveDashboard(false);
      setActiveSettings(false);
      setActiveEmployees(false);
      setActiveDepartments(false);
      setActivePolicy(false);
      setActiveFinance(false)
      setActiveInventory(false)
      // setLeaves(false);
      // setLoan(false);
    }
  }, [location.pathname]);

  const navigateDashboard = () => {
    navigate("/");
  };
  function navigateSetting() {
    navigate("/settings");
  }
  const navigateEmployees = () => {
    navigate("/employees");
  };
  const navigateFinance = () => {
    navigate("/finance")
  };
  const navigateInventory = () => {
    navigate("/inventory")
  };
  const navigateDepartments = () => {
    navigate("/teams");
  };



  const sidebarButtons = [
    {
      label: "Dashboard",
      icon: dashBoardIcon,
      onClick: navigateDashboard,
      active: activeDashboard,
      show: true,
    },
    {
      label: "Swap",
      icon: swapIcon,
      onClick: () => { },
      active: false,
      show: true,
    },
    {
      label: "Employees",
      icon: employeesIcon,
      onClick: navigateEmployees,
      active: activeEmpoyees,
      show: props.superAdmin,
    },
    {
      label: "Finance",
      icon: financeIcon,
      onClick: navigateFinance,
      active: activeFinance,
      show: props.superAdmin,
    },
    {
      label: "Inventory",
      icon: registerIcon,
      onClick: navigateInventory,
      active: activeInventory,
      show: props.superAdmin,
    },
    {
      label: "Teams",
      icon: departmentsIcon,
      onClick: navigateDepartments,
      active: activeDepartments,
      show: props.superAdmin,
    },
    {
      label: "Settings",
      icon: settingsIcon,
      onClick: navigateSetting,
      active: activeSettings,
      show: true, 
    }

  ];

  return (
    <>
      <div className="flex items-center gap-[21px] pl-7 md:pl-[50px] w-full">
        <div className="bg-[#C4C4C4] w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-[14px] p-0.5">
          <div className="relative w-full h-full rounded-[14px] bg-[#28357399] flex items-center justify-center">
            <img src={profileImg} alt="profileImg" className="w-auto h-auto" />
            <ImageButton
              onClick={navigateSetting}
              buttonClasses="absolute  -top-2 -right-2"
            >
              <img src={settingIcon} alt="setting" />
            </ImageButton>
          </div>
        </div>
        <div>
          <h1 className="text-base md:text-xl font-poppins font-normal text-white">
            Hello, <span className="font-semibold">{props.name}</span>
          </h1>
          <p className="text-xs md:text-sm font-normal text-[#9B94C1] dark:text-white ">
            {props.sidebarEmail}
          </p>
        </div>
      </div>

      <div className=" mt-[13px] h-[calc(100%-30%)] overflowXAuto">
        {isLoaded && (
          <div className="flex flex-col sidebarButtonAnimation">
            {sidebarButtons.filter(button => button.show).map((button, index) => (
              <Button
                key={button.label}
                onClick={button.onClick}
                buttonClasses={`!w-full !pl-7 md:!pl-[50px] !pr-2.5 !h-[67px] !font-poppins !text-white !text-sm sm:text-base !text-left relative !flex !justify-start w-full items-center gap-[22px] ${button.active ? activeClass : "bg-transparent !font-medium"
                  }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {button.active && (
                  <div className="w-2.5 h-full rounded-tr-lg rounded-br-lg absolute left-0 bg-[#FD073A] top-0"></div>
                )}
                <div className="w-8 h-8">
                  <img
                    src={button.icon}
                    alt={button.label.toLowerCase()}
                    className="w-full h-full"
                  />
                </div>
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-10 w-[calc(100%-40px)] left-5">
        <Button
          onClick={props.sideBarLogout}
          buttonClasses="bg-[#FD073A] h-12 w-full p-2.5 rounded-[16px] font-poppins text-base text-center leading-7 font-inter text-white font-medium uppercase border-2 border-solid border-[#283573]"
        >
          Logout
        </Button>
      </div>
    </>
  );
}
