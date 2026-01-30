import React from 'react';
import ReactDOM from 'react-dom';
import closeIcon from "../assets/images/closeIcon.svg"

interface DeleteModalProps {
  modalClassName?: string;
  children: React.ReactNode;
  modalMain?: string;
  onClick?: () => void;
  closeButtonCLick?: () => void;
}

const DeleteModal = React.forwardRef<HTMLDivElement, DeleteModalProps>(({
  modalClassName,
  modalMain,
  children,
  onClick,
  closeButtonCLick,
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
      className={`h-screen flex justify-center items-center bg-[#5558948f] px-4 bg-cover z-[999999] absolute top-0 w-full backdrop-blur-[7px] ${modalMain}`}
      {...props}
    >

    <div
        ref={ref}
        className={`relative bodyBackground min-w-[300px] w-full max-w-[500px] rounded-[15px] overflow-hidden transition-opacity duration-500 min-h-[200px] ${modalClassName}`}
      >
        <button onClick={closeButtonCLick} type='button' className='absolute top-6 right-6'>
          <img src={closeIcon} alt='close' />
        </button>
        {children}
      </div>

    </div>

    </>,
    modalRoot
  );
});

export default DeleteModal;
