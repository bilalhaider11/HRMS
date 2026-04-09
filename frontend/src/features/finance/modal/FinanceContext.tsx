import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchFinanceRecords, fetchFinanceCategories, fetchBankAccounts, deleteFinanceCategory as deleteCategoryApi } from '../api/financeApi';

export interface FinanceTableData {
  FinanceId?: string;
  Date?: string;
  RawDate?: string;
  Description?: string;
  Amount?: number;
  TaxDeductions?: number;
  ChequeNumber?: string;
  CategoryID?: number;
  CategoryName?: string;
  CategoryColor?: string;
  BankAccountId?: number;
  AddedBy?: string;
  CreatedAt?: string;
  HasEdits?: boolean;
}

export interface FinanceCategoriesData {
  id?: string;
  name?: string;
  colorCode?: string;
}

export interface BankAccountData {
  id?: string;
  account_name?: string;
  bank_name?: string;
  account_number?: string;
  branch_code?: string;
  iban_number?: string;
  opening_balance?: number;
  total_income?: number;
  total_expense?: number;
  current_balance?: number;
}

export interface FinanceSummary {
  total_income: number;
  total_expense: number;
  net: number;
}

interface FinanceContextType {
  financeList: FinanceTableData[];
  financeCategoriesList: FinanceCategoriesData[];
  bankAccountsList: BankAccountData[];
  selectedBankAccountId: string;
  setSelectedBankAccountId: (id: string) => void;
  financeSummary: FinanceSummary;
  loadBankAccounts: () => Promise<void>;

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
  isDeleteModal: FinanceTableData | null;
  setIsDeleteModal: (fin: FinanceTableData | null) => void;
  isDeleteCategoryModal: FinanceCategoriesData | null;
  setIsDeleteCategoryModal: (cate: FinanceCategoriesData | null) => void;
  handleFinanceDelete: (finance: FinanceTableData) => void;
  handleCategoryDelete: (category: FinanceCategoriesData) => void;

  loadFinance: (page?: number, pageSize?: number, startDate?: string, endDate?: string, categoryId?: string, bankAccountId?: string) => Promise<void>;
  financePage: number;
  financeTotalPages: number;
  financeTotalCount: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider');
  return context;
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [financeList, setFinanceList] = useState<FinanceTableData[]>([]);
  const [financeCategoriesList, setFinanceCategoriesList] = useState<FinanceCategoriesData[]>([]);
  const [bankAccountsList, setBankAccountsList] = useState<BankAccountData[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("");
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({ total_income: 0, total_expense: 0, net: 0 });
  const [idExistError, setIdExistError] = useState("");
  const [editingFinance, setEditingFinance] = useState<FinanceTableData | null>(null);
  const [successfullModal, setSuccessfullModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState<FinanceTableData | null>(null);
  const [isDeleteCategoryModal, setIsDeleteCategoryModal] = useState<FinanceCategoriesData | null>(null);
  const [editingCategory, setEditingCategory] = useState<FinanceCategoriesData | null>(null);
  const [financePage, setFinancePage] = useState(1);
  const [financeTotalPages, setFinanceTotalPages] = useState(1);
  const [financeTotalCount, setFinanceTotalCount] = useState(0);
  const [lastPageSize, setLastPageSize] = useState(50);
  const [lastFilters, setLastFilters] = useState<{
    startDate?: string; endDate?: string; categoryId?: string; bankAccountId?: string;
  }>({});

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
    const datePart = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();
    return `${datePart} ${timePart}`;
  };

  const loadBankAccounts = async () => {
    try {
      const data = await fetchBankAccounts();
      const mapped = (data || []).map((a: any) => ({
        id: String(a.id),
        account_name: a.account_name,
        bank_name: a.bank_name,
        account_number: a.account_number,
        branch_code: a.branch_code,
        iban_number: a.iban_number,
        opening_balance: a.opening_balance,
        total_income: a.total_income,
        total_expense: a.total_expense,
        current_balance: a.current_balance,
      }));
      setBankAccountsList(mapped);
      // Auto-select first account if nothing selected yet
      if (!selectedBankAccountId && mapped.length > 0) {
        setSelectedBankAccountId(mapped[0].id || "");
      }
    } catch (error) {
      console.error("Failed to load bank accounts:", error);
    }
  };

  const loadFinance = async (
    page = 1, pageSize = 50,
    startDate?: string, endDate?: string,
    categoryId?: string, bankAccountId?: string,
  ) => {
    try {
      setLastPageSize(pageSize);
      setLastFilters({ startDate, endDate, categoryId, bankAccountId });
      const catIdNum = categoryId ? parseInt(categoryId) : undefined;
      const bankAccIdNum = bankAccountId ? parseInt(bankAccountId) : undefined;
      const data = await fetchFinanceRecords(page, pageSize, startDate, endDate, catIdNum, bankAccIdNum);
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
        BankAccountId: r.bank_account_id,
        AddedBy: r.added_by_name || "",
        CreatedAt: r.created_at ? formatDateTime(r.created_at) : "",
        HasEdits: r.has_edits || false,
      }));
      setFinanceList(mapped);
      setFinancePage(data.page || 1);
      setFinanceTotalPages(data.total_pages || 1);
      setFinanceTotalCount(data.total_count || 0);
      if (data.summary) {
        setFinanceSummary({
          total_income: data.summary.total_income || 0,
          total_expense: data.summary.total_expense || 0,
          net: data.summary.net || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load finance records:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [catData, bankData] = await Promise.all([
          fetchFinanceCategories(),
          fetchBankAccounts(),
        ]);
        const mappedCats = (catData || []).map((c: any) => ({
          id: String(c.category_id),
          name: c.category_name,
          colorCode: c.color_code,
        }));
        setFinanceCategoriesList(mappedCats);

        const mappedBanks = (bankData || []).map((a: any) => ({
          id: String(a.id),
          account_name: a.account_name,
          bank_name: a.bank_name,
          account_number: a.account_number,
          branch_code: a.branch_code,
          iban_number: a.iban_number,
          opening_balance: a.opening_balance,
          total_income: a.total_income,
          total_expense: a.total_expense,
          current_balance: a.current_balance,
        }));
        setBankAccountsList(mappedBanks);

        if (mappedBanks.length > 0) {
          setSelectedBankAccountId(mappedBanks[0].id || "");
        }
      } catch (error) {
        console.error("Failed to load finance init data:", error);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFinance = (_finance: FinanceTableData) => {
    loadFinance(financePage, lastPageSize, lastFilters.startDate, lastFilters.endDate, lastFilters.categoryId, lastFilters.bankAccountId);
    loadBankAccounts();
    setEditingFinance(null);
    setIdExistError("");
    setSuccessfullModal(true);
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return true;
  };

  const editFinanceData = (finance: FinanceTableData) => {
    setEditingFinance(finance);
    setSuccessfullModal(false);
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
  };

  const updateFinance = (_updatedFinance: FinanceTableData) => {
    loadFinance(financePage, lastPageSize, lastFilters.startDate, lastFilters.endDate, lastFilters.categoryId, lastFilters.bankAccountId);
    loadBankAccounts();
    setSuccessfullModal(true);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    setIdExistError("");
  };

  const handleFinanceDelete = (_finance: FinanceTableData) => {
    setIsDeleteModal(null);
  };

  const addCategory = (category: FinanceCategoriesData) => {
    setFinanceCategoriesList(prev => [...prev, category]);
    setEditingCategory(null);
    setIdExistError("");
    setSuccessfullModal(true);
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return true;
  };

  const editCategoryData = (category: FinanceCategoriesData) => {
    setEditingCategory(category);
    setSuccessfullModal(false);
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
  };

  const updateFinanceCategory = (updatedCategory: FinanceCategoriesData) => {
    setFinanceCategoriesList(prev =>
      prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
    );
    setSuccessfullModal(true);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    setIdExistError("");
  };

  const handleCategoryDelete = async (category: FinanceCategoriesData) => {
    try {
      await deleteCategoryApi(parseInt(category.id || "0"));
      setFinanceCategoriesList(prev => prev.filter(c => c.id !== category.id));
    } catch (error: any) {
      console.error("Failed to delete category:", error?.response?.data?.detail || error);
    }
    setIsDeleteCategoryModal(null);
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
  };

  const clearError = () => setIdExistError("");

  return (
    <FinanceContext.Provider value={{
      financeList, financeCategoriesList, bankAccountsList,
      selectedBankAccountId, setSelectedBankAccountId, financeSummary,
      loadBankAccounts, addFinance, clearError, idExistError,
      successfullModal, setSuccessfullModal,
      editingFinance, editFinanceData, updateFinance, setEditingFinance,
      isDeleteModal, setIsDeleteModal, handleFinanceDelete,
      editCategoryData, editingCategory, setEditingCategory,
      addCategory, updateFinanceCategory,
      isDeleteCategoryModal, setIsDeleteCategoryModal, handleCategoryDelete,
      loadFinance, financePage, financeTotalPages, financeTotalCount,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
