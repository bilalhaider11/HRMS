

interface SelectProps {
  children: React.ReactNode;
  selectClassName?: string;
  selectArrowClassName?: string;
  selectArrowPath?: string;
  onClick?: () => void;
}

const Select = ({
  children,
  selectArrowClassName,
  selectClassName,
  selectArrowPath,
  ...props
}: SelectProps) => {
  return (
    <>
      <button
        type="button"
        {...props}
        className={`flex items-center ${selectClassName}`}
      >
        {children}
        <img
          src={selectArrowPath}
          alt="arrow"
          className={selectArrowClassName}
        />
      </button>
    </>
  );
};

export default Select;
