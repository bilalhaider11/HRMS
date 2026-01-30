import React from 'react';
import { useField } from 'formik';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps 
{
  name: string;
  label: string;
  labelClassName?: string;
  inputClassName?: string;
  options: Option[];
  disabled?: boolean;
  selectOption?: string;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, labelClassName, inputClassName, selectOption, options, onClick, onFocus, onBlur, ...props }) => {
  const [field, meta, helpers] = useField(props.name);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    helpers.setValue(event.target.value);
  };

  const handleBlur = () => {
    helpers.setTouched(true);
  };

  return (
    <div className="flex flex-col items-start">
      <label htmlFor={props.name} className={`font-semibold text-white text-base md:text-lg lg:text-[21px] font-urbanist lg:leading-[180%] ${labelClassName}`}>{label}</label>
      <select
        {...field}
        {...props}
        id={props.name}
        onChange={handleChange}
        onBlur={(e) => {
          handleBlur();
          onBlur?.();
        }}
        onFocus={onFocus}
        onClick={onClick}
        className={`w-full px-6 py-4 h-[65px] bg-[#a0a1a8] outline-none text-[#747681] placeholder-[#747681] font-urbanist text-lg font-medium ${inputClassName}`}
        style={{ appearance: "none" }}
      >
        <option value="" className='text-black'>{selectOption}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className='text-black'>
            {option.label}
          </option>
        ))}
      </select>

    </div>
  );
};

export default SelectField;