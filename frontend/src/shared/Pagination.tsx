import { useState, useEffect } from "react";

interface PaginationProps {
  totalPosts?: number;
  postsPerPage?: number;
  currentPage?: number;
  currentPageSet?: (page: number) => void;
}

export default function Pagination(props: PaginationProps) {
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);
  useEffect(() => {
    const pageNumbers: number[] = [];
    if (props.totalPosts && props.postsPerPage) {
      for (
        let i = 1;
        i <= Math.ceil(props.totalPosts / props.postsPerPage);
        i++
      ) {
        pageNumbers.push(i);
      }
    }
    setPageNumbers(pageNumbers);
  }, [props.postsPerPage, props.totalPosts]);

  const nextPage = () => {
    if (props.currentPage && props.currentPage < pageNumbers.length) {
      props.currentPageSet && props.currentPageSet(props.currentPage + 1);
    }
  };
  const previousPage = () => {
    if (props.currentPage && props.currentPage > 1) {
      props.currentPageSet && props.currentPageSet(props.currentPage - 1);
    }
  };
  return (
    <div className="flex gap-px md:gap-[18px]">
      <button
      className="-rotate-[180deg]"
        onClick={previousPage}
        disabled={props.currentPage === 1}
      >
          <svg
          width="31"
          height="31"
          viewBox="0 0 31 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.2636 10.1927L16.1122 15.0414L11.2636 19.89C11.1479 20.0057 11.0561 20.1431 10.9935 20.2942C10.9309 20.4454 10.8987 20.6074 10.8987 20.771C10.8987 20.9346 10.9309 21.0966 10.9935 21.2478C11.0561 21.399 11.1479 21.5363 11.2636 21.652C11.3793 21.7677 11.5166 21.8595 11.6678 21.9221C11.8189 21.9847 11.981 22.0169 12.1446 22.0169C12.3082 22.0169 12.4702 21.9847 12.6214 21.9221C12.7725 21.8595 12.9099 21.7677 13.0256 21.652L18.7615 15.9161C18.8773 15.8005 18.9693 15.6632 19.032 15.512C19.0947 15.3608 19.127 15.1988 19.127 15.0351C19.127 14.8714 19.0947 14.7094 19.032 14.5582C18.9693 14.407 18.8773 14.2697 18.7615 14.1541L13.0256 8.41819C12.91 8.30234 12.7727 8.21043 12.6215 8.14772C12.4703 8.08501 12.3082 8.05273 12.1446 8.05273C11.9809 8.05273 11.8189 8.08501 11.6677 8.14772C11.5165 8.21043 11.3792 8.30234 11.2636 8.41819C10.7887 8.90555 10.7762 9.70533 11.2636 10.1927V10.1927Z"
            fill={props.currentPage === 1 ? "#FFFFFF52" : "white"}
          />
        </svg>
      </button>
   
      <button className="outline-none bg-transparent" onClick={nextPage} disabled={props.currentPage === pageNumbers.length}>
        <svg
          width="31"
          height="31"
          viewBox="0 0 31 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.2636 10.1927L16.1122 15.0414L11.2636 19.89C11.1479 20.0057 11.0561 20.1431 10.9935 20.2942C10.9309 20.4454 10.8987 20.6074 10.8987 20.771C10.8987 20.9346 10.9309 21.0966 10.9935 21.2478C11.0561 21.399 11.1479 21.5363 11.2636 21.652C11.3793 21.7677 11.5166 21.8595 11.6678 21.9221C11.8189 21.9847 11.981 22.0169 12.1446 22.0169C12.3082 22.0169 12.4702 21.9847 12.6214 21.9221C12.7725 21.8595 12.9099 21.7677 13.0256 21.652L18.7615 15.9161C18.8773 15.8005 18.9693 15.6632 19.032 15.512C19.0947 15.3608 19.127 15.1988 19.127 15.0351C19.127 14.8714 19.0947 14.7094 19.032 14.5582C18.9693 14.407 18.8773 14.2697 18.7615 14.1541L13.0256 8.41819C12.91 8.30234 12.7727 8.21043 12.6215 8.14772C12.4703 8.08501 12.3082 8.05273 12.1446 8.05273C11.9809 8.05273 11.8189 8.08501 11.6677 8.14772C11.5165 8.21043 11.3792 8.30234 11.2636 8.41819C10.7887 8.90555 10.7762 9.70533 11.2636 10.1927V10.1927Z"
            fill={props.currentPage === pageNumbers.length ? "#FFFFFF52" :  "white"}
          />
        </svg>
      </button>
    </div>
  );
}
