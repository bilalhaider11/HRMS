import { ReactNode, forwardRef } from "react";

interface BoxProps {
  children: ReactNode;
  boxMainDivClasses?: string;
  boxClass?: string;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, boxMainDivClasses, boxClass }, ref) => {
    return (
      <>
        <div
          ref={ref}
          className={`w-full h-auto rounded-[15px] overflow-hidden ${boxMainDivClasses}`}
        >
          <div
            className={`w-full h-full border-transparent rounded-[15px] blurBackground cardsBorder backdrop-blur-[41px] ${boxClass}`}
          >
            {children}
          </div>
        </div>
      </>
    );
  }
);

export default Box;
