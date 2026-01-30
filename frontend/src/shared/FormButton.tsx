interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  buttonClasses?: string;
}

export default function FormButton({
  children,
  buttonClasses,
  ...props
}: FormButtonProps) {
  return (
    <button
      {...props}
      className={` w-full bg-primary-900 h-10 py-2 px-4 rounded-[10px] font-inter font-medium text-sm text-white text-center ${buttonClasses}`}
    >
      {children}
    </button>
  );
}
