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
      className={`w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed h-11 py-2 px-4 rounded-xl font-inter font-medium text-sm text-white text-center transition-colors ${buttonClasses}`}
    >
      {children}
    </button>
  );
}
