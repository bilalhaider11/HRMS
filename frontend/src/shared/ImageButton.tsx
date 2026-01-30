interface ImageButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  buttonClasses?: string;
}

export default function ImageButton({
  children,
  buttonClasses,
  ...props
}: ImageButtonProps) {
  return (
    <button
      {...props}
      className={` ${buttonClasses}`}
    >
      {children}
    </button>
  );
}
