import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

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
    <div
      onClick={onClick}
      className={`fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm px-4 z-[999999] ${modalMain}`}
      {...props}
    >
      <div
        ref={ref}
        className={`relative bg-slate-900 border border-slate-800 min-w-[300px] w-full max-w-[500px] rounded-2xl overflow-hidden transition-opacity duration-300 min-h-[200px] ${modalClassName}`}
      >
        <button onClick={closeButtonCLick} type='button' className='absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors'>
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
});

export default DeleteModal;
