// interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   children: React.ReactNode;
//   buttonClasses?: string;
// }

// export default function Button({
//   children,
//   buttonClasses,
//   ...props
// }: ButtonProps) {
//   return (
//     <button
//       {...props}
//       className={` text-center text-base font-semibold outline-none cursor-pointer ${buttonClasses}`}
//     >
//       {children}
//     </button>
//   );
// }


// ✅ src/components/common/Button.tsx
import React from "react"
import { Button as ShadcnButton } from "../components/Button"

interface MyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  buttonClasses?: string
  disableDefaultStyles?: boolean
}

export default function Button({
  children,
  buttonClasses,
  className,
  disableDefaultStyles,
  ...props
}: MyButtonProps) {
  if (disableDefaultStyles) {
    return (
      <button
        {...props}
        className={`${buttonClasses ?? ""} ${className ?? ""}`}
      >
        {children}
      </button>
    )
  }

  return (
    <ShadcnButton className={`${className ?? ""} w-fit min-h-[42px] ${buttonClasses ?? ""}`} {...props}>
      {children}
    </ShadcnButton>
  )
}
