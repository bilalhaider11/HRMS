import { ReactNode, forwardRef } from "react";

interface BoxProps {
  children: ReactNode;
  boxMainDivClasses?: string;
  boxClass?: string;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, boxMainDivClasses, boxClass }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full h-auto rounded-2xl overflow-hidden ${boxMainDivClasses}`}
      >
        <div
          className={`w-full h-full bg-slate-900 border border-slate-800 rounded-2xl ${boxClass}`}
        >
          {children}
        </div>
      </div>
    );
  }
);

export default Box;
