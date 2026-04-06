import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchFinanceRecords, fetchFinanceCategories, deleteFinanceCategory as deleteCategoryApi } from '../api/financeApi';

export interface FinanceTableData {
  FinanceId?: string,
  Date?: string,
  RawDate?: string,
  Description?: string,
  Amount?: number,
  TaxDeductions?: number,
  ChequeNumber?: string,
  CategoryID?: number,
  CategoryName?: string,
  CategoryColor?: string,
  AddedBy?: string,
  CreatedAt?: string,
  HasEdits?: boolean
}

export interface FinanceCategoriesData {
  id?: string,
  name?: string,
  colorCode?: string
}

interface FinanceContextType {
  financeList: FinanceTableData[];
  financeCategoriesList: FinanceCategoriesData[];
  setEditingFinance: (fin: FinanceTableData | null) => void;
  setEditingCategory: (category: FinanceCategoriesData | null) => void;
  addFinance: (finance: FinanceTableData) => boolean;
  addCategory: (category: FinanceCategoriesData) => boolean;
  editingFinance: FinanceTableData | null;
  editingCategory: FinanceCategoriesData | null;
  idExistError: string;
  clearError: () => void;
  successfullModal: boolean;
  setSuccessfullModal: (value: boolean) => void;
  updateFinance: (fin: FinanceTableData) => void;
  editFinanceData: (fin: FinanceTableData) => void;
  updateFinanceCategory: (cate: FinanceCategoriesData) => void;
  editCategoryData: (cate: FinanceCategoriesData) => void;
  isDeleteModal: FinanceTableData | null
  setIsDeleteModal: (fin: FinanceTableData | null) => void
  isDeleteCategoryModal: FinanceCategoriesData | null
  setIsDeleteCategoryModal: (cate: FinanceCategoriesData | null) => void

  handleFinanceDelete: (finance: FinanceTableData) => void;
  handleCategoryDelete: (category: FinanceCategoriesData) => void;

  loadFinance: (page?: number, pageSize?: number) => Promise<void>;
  financePage: number;
  financeTotalPages: number;
  financeTotalCount: number;
}


const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('Error');
  }
  return context;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [financeList, setFinanceList] = useState<FinanceTableData[]>([]);
  const [financeCategoriesList, setFinanceCategoriesList] = useState<FinanceCategoriesData[]>([])
  const [idExistError, setIdExistError] = useState("")
  const [editingFinance, setEditingFinance] = useState<FinanceTableData | null>(null);
  const [successfullModal, setSuccessfullModal] = useState<boolean>(false)
  const [isDeleteModal, setIsDeleteModal] = useState<FinanceTableData | null>(null);
  const [isDeleteCategoryModal, setIsDeleteCategoryModal] = useState<FinanceCategoriesData | null>(null)
  const [editingCategory, setEditingCategory] = useState<FinanceCategoriesData | null>(null)
  const [financePage, setFinancePage] = useState(1);
  const [financeTotalPages, setFinanceTotalPages] = useState(1);
  const [financeTotalCount, setFinanceTotalCount] = useState(0);
  const [lastPageSize, setLastPageSize] = useState(50);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();
    return `${datePart} ${timePart}`;
  };

  const loadFinance = async (page: number = 1, pageSize: number = 50) => {
    try {
      setLastPageSize(pageSize);
      const data = await fetchFinanceRecords(page, pageSize);
      const mapped = (data.records || []).map((r: any) => ({
        FinanceId: String(r.id),
        Date: r.date ? formatDate(r.date) : "",
        RawDate: r.date || "",
        Description: r.description,
        Amount: r.amount,
        TaxDeductions: r.tax_deductions,
        ChequeNumber: r.cheque_number,
        CategoryID: r.category_id,
        CategoryName: r.category_name || "",
        CategoryColor: r.category_color || "",
        AddedBy: r.added_by_name || "",
        CreatedAt: r.created_at ? formatDateTime(r.created_at) : "",
        HasEdits: r.has_edits || false,
      }));
      setFinanceList(mapped);
      setFinancePage(data.page || 1);
      setFinanceTotalPages(data.total_pages || 1);
      setFinanceTotalCount(data.total_count || 0);
    } catch (error) {
      console.error("Failed to load finance records:", error);
    }
  };

  useEffect(() => {
    const loadFinanceCategories = async () => {
      try {
        const data = await fetchFinanceCategories();
        const mapped = (data || []).map((c: any) => ({
          id: String(c.category_id),
          name: c.category_name,
          colorCode: c.color_code,
        }));
        setFinanceCategoriesList(mapped);
      } catch (error) {
        console.error("Failed to load finance categories:", error);
      }
    };

    loadFinanceCategories();
    loadFinance(1, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFinance = (_finance: FinanceTableData) => {
    loadFinance(financePage, lastPageSize);
    setEditingFinance(null)
    setIdExistError("")
    setSuccessfullModal(true)
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden"
    return true
  };

  const editFinanceData = (finance: FinanceTableData) => {
    console.log(finance)
    setEditingFinance(finance);
    setSuccessfullModal(false);
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
  };

  const updateFinance = (_updatedFinance: FinanceTableData) => {
    loadFinance(financePage, lastPageSize);
    setSuccessfullModal(true);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    setIdExistError("");
  };

  // Finance records cannot be deleted — only edited (with history tracking)
  const handleFinanceDelete = (_finance: FinanceTableData) => {
    setIsDeleteModal(null);
  }

  const addCategory = (category: FinanceCategoriesData) => {

    const updatedCategoryList = [...financeCategoriesList, category];
    console.log("added")
    setFinanceCategoriesList(updatedCategoryList);
    setEditingCategory(null)
    setIdExistError("")
    setSuccessfullModal(true)
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden"
    return true

  };

  const editCategoryData = (category: FinanceCategoriesData) => {
    console.log(category)
    setEditingCategory(category);
    setSuccessfullModal(false);
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
  };

  const updateFinanceCategory = (updatedCategory: FinanceCategoriesData) => {

    const updatedList = financeCategoriesList.map((cate) =>
      cate.id === updatedCategory.id ? updatedCategory : cate
    );
    console.log("updateList", updatedList)
    setFinanceCategoriesList(updatedList);
    setSuccessfullModal(true);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    setIdExistError("");
  };
  const handleCategoryDelete = async (category: FinanceCategoriesData) => {
    try {
      await deleteCategoryApi(parseInt(category.id || "0"));
      const updatingList = financeCategoriesList.filter(c => c.id !== category.id);
      setFinanceCategoriesList(updatingList);
    } catch (error: any) {
      console.error("Failed to delete category:", error?.response?.data?.detail || error);
    }
    setIsDeleteCategoryModal(null);
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
  }

  const clearError = () => setIdExistError("");


  return (
    <FinanceContext.Provider value={{ financeList, addFinance, clearError, idExistError, successfullModal, setSuccessfullModal, editingFinance, editFinanceData, updateFinance, setEditingFinance, isDeleteModal, setIsDeleteModal, handleFinanceDelete, financeCategoriesList, editCategoryData, editingCategory, setEditingCategory, addCategory, updateFinanceCategory, isDeleteCategoryModal, setIsDeleteCategoryModal, handleCategoryDelete, loadFinance, financePage, financeTotalPages, financeTotalCount }}>
      {children}
    </FinanceContext.Provider>
  );
};
