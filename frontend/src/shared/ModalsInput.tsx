interface ModalsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    labelClassName?: string;
    inputClassName?: string;
  }
  
  export default function ModalsInput({
    label,
    labelClassName,
    inputClassName,
    ...props
  }: ModalsInputProps) {
    return (
      <div className="flex flex-col gap-3 items-start">
        <label className={` text-xl text-white font-urbanist leading-[160%] font-semibold ${labelClassName}`}>
          {label}
        </label>
        <input
          {...props}
          className={` w-full bg-[#F5F5F5] outline-none border-none px-4 py-3 placeholder-[#04091E99] text-black font-urbanist leading-normal text-base ${inputClassName}`}
        />
      </div>
    );
  }
  