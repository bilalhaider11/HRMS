import React from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle } from 'lucide-react';

interface SuccessfullModalProps {
  modalClassName?: string;
  children: React.ReactNode;
  modalMain?: string;
  onClick?: () => void;
  successfullOk?: () => void;
}

const SuccessfullModal = React.forwardRef<HTMLDivElement, SuccessfullModalProps>(({
  modalClassName,
  modalMain,
  children,
  onClick,
  successfullOk,
  ...props
}, ref) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div
      onClick={onClick}
      className={`fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm px-4 z-[999999] ${modalMain}`}
      {...props}
    >
      <div
        ref={ref}
        className={`relative bg-slate-900 border border-slate-800 min-w-[300px] w-full max-w-[400px] rounded-2xl overflow-hidden p-8 ${modalClassName}`}
      >
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-lg font-semibold leading-normal text-center font-inter text-white">
          {children}
        </h1>
        <button
          type="button"
          onClick={successfullOk}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl h-11 w-full font-inter font-medium text-sm leading-7 text-white mt-6 transition-colors"
        >
          OK
        </button>
      </div>
    </div>,
    modalRoot
  );
});

export default SuccessfullModal;
