import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

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
  const [showBorder, setShowBorder] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowBorder(true);

    const bgTimer = setTimeout(() => setShowBackground(true), 2000);
    const headingTimer = setTimeout(() => setShowHeading(true), 2200);
    const buttonTimer = setTimeout(() => setShowButton(true), 2400);

    return () => {
      clearTimeout(bgTimer);
      clearTimeout(headingTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <>
      <div
        onClick={onClick}
        className={`h-screen flex justify-center items-center bg-[#5558948f] px-4 bg-cover z-[999999] absolute top-0 w-full backdrop-blur-[7px] ${modalMain}`}
        {...props}
      >
        <div
          ref={ref}
          className={`relative min-w-[300px] w-full max-w-[500px] rounded-[15px] overflow-hidden transition-opacity duration-500 ${
            showBorder ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {showBorder && (
            <svg
              className="absolute top-0 left-0 w-full h-full z-10"
              viewBox="0 0 750 200"
              preserveAspectRatio="none"
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="15"
                ry="15"
                className="sketch-rect"
              />
            </svg>
          )}

          <div
            className={`relative z-20 transition-opacity duration-700 ease-in-out p-8 ${
              showBackground ? 'opacity-100 bodyBackground' : 'opacity-0'
            }`}
          >
            <h1
              className={`text-2xl font-semibold leading-normal text-center font-poppins text-white sketch-content-title transition-opacity duration-500 ${
                showHeading ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {children}
            </h1>

            <button
              type="button"
              onClick={successfullOk}
              className={`py-2.5 px-4 bg-[#259DA8] rounded-[12px] h-12 w-full font-inter font-medium text-base leading-7 text-white mt-8 transition-opacity duration-500 ${
                showButton ? 'opacity-100' : 'opacity-0'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>,
    modalRoot
  );
});

export default SuccessfullModal;
