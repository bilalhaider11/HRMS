import Button from "../shared/Button";
import menuIcon from "../assets/images/menu.svg";
import navLogo from "../assets/images/navLogo.png";
import ImageButton from "../shared/ImageButton";

interface NavbarProps {
  sideBarClosed: () => void;
}

export default function NavBar({ sideBarClosed }: NavbarProps) {
  return (
    <nav className="py-4 md:py-[25px] flex justify-between items-center">
      <div className="flex items-center gap-[17px]">
        <ImageButton
          type="button"
          onClick={sideBarClosed}
          buttonClasses="w-[30px] h-[30px] md:w-[60px] md:h-[60px] outline-none bg-transparent"
        >
          <img src={menuIcon} alt="menu" className="w-full h-full" />
        </ImageButton>
        <div>
          <img src={navLogo} alt="logo" className="w-[70%] md:w-full h-auto" />
        </div>
      </div>
      <div className="hidden md:flex gap-[17px] items-center">
        <div className="rounded-[13px] w-fit overflow-hidden">
        <Button
          type="button"
          buttonClasses="blurBackground h-[54px] blurBorder text-base text-white font-medium leading-7 font-inter py-[11.11px] px-[17.78px] !rounded-[13px]"
        >
          Buy & Sell
        </Button>
        </div>
        <Button
          type="button"
          buttonClasses="bg-[#259DA814] h-[54px] text-base font-medium leading-7 font-inter py-[11.11px] px-[17.78px] rounded-[13px] text-[#FE0639]"
        >
          Connect Wallet
        </Button>
      </div>
    </nav>
  );
}
