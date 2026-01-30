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
      <label className={` ${labelClassName}`}>
        {label}
      </label>
      <div className={`relative w-full ${inputMainBorder}`}>
      <input
        {...props}
        className={`w-full outline-none text-sm md:text-base leading-normal ${inputClassName}`}
      />
      </div>
    </div>
  );
}
