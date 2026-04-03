interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  inputMainBorder?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export default function FormInput({
  label,
  labelClassName,
  inputClassName,
  inputMainBorder,
  ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col items-start">
      <label className={labelClassName || "block text-sm font-medium text-slate-300 mb-2 font-inter"}>
        {label}
      </label>
      <div className={`relative w-full ${inputMainBorder || ""}`}>
      <input
        {...props}
        className={`w-full outline-none text-sm md:text-base leading-normal ${inputClassName || "px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-inter placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"}`}
      />
      </div>
    </div>
  );
}
