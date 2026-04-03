import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPosts?: number;
  postsPerPage?: number;
  currentPage?: number;
  currentPageSet?: (page: number) => void;
}

export default function Pagination(props: PaginationProps) {
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);
  useEffect(() => {
    const pages: number[] = [];
    if (props.totalPosts && props.postsPerPage) {
      for (let i = 1; i <= Math.ceil(props.totalPosts / props.postsPerPage); i++) {
        pages.push(i);
      }
    }
    setPageNumbers(pages);
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

  const totalPages = pageNumbers.length;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={previousPage}
        disabled={props.currentPage === 1}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm text-slate-400 font-inter px-2">
        Page {props.currentPage || 1} of {totalPages || 1}
      </span>

      <button
        onClick={nextPage}
        disabled={props.currentPage === totalPages}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
