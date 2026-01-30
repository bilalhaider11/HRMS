import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  modalClassName?: string;
  children: React.ReactNode;
  modalMain?: string;
  onClick?: () => void;
}

const AuthModal = React.forwardRef<HTMLDivElement, ModalProps>(({
  modalClassName,
  modalMain,
  children,
  onClick,
  ...props
}, ref) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    return null;
  }
  return ReactDOM.createPortal (
    <>
    <div
      onClick={onClick}
      className={`${modalMain} h-screen flex justify-center items-center flex bg-[#555894] px-4 bg-cover z-[999999]`}
      {...props}
    >

    <div
        ref={ref}
        className={` bodyBackground h-[calc(100%-40px)] modalBoxShadow overflowYAuto border border-solid border-[#FFFFFF21] w-full ${modalClassName}`}
      >
        {children}
      </div>

    </div>

    </>,
    modalRoot
  );
});

export default AuthModal;
