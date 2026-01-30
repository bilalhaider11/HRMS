import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchFinanceTableData, fetchFinanceCategoriesData } from '../api/finance';

export interface FinanceTableData {
  FinanceId?: string,
  Date?: string,
  Description?: string,
  Amount?: number,
  TaxDeductions?: number,
  ChequeNumber?: string,
  CategoryID?: number,
  AddedBy?: string,
  CompanyID?: number
}

export interface FinanceCategoriesData {
  id?: string,
  name?: string,
  colorCode?: string,
  companyId?: number
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

  useEffect(() => {
    const loadFinance = async () => {
      try {
        const data = await fetchFinanceTableData();
        setFinanceList(data.financeAllList);
      } catch (error) {
        console.error(error);
      }
    };

    const loadFinanceCategories = async () => {
      try {
        const data = await fetchFinanceCategoriesData()
        setFinanceCategoriesList(data.financeCategories)
      } catch (error) {
        console.log(error)
      }
    }

    loadFinanceCategories()
    loadFinance();

  }, []);

  const addFinance = (finance: FinanceTableData) => {

    const updatedList = [...financeList, finance];
    console.log("added")
    setFinanceList(updatedList);
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

  const updateFinance = (updatedFinance: FinanceTableData) => {

    const updatedList = financeList.map((fin) =>
      fin.FinanceId === updatedFinance.FinanceId ? updatedFinance : fin
    );
    console.log("updateList", updatedList)
    setFinanceList(updatedList);
    setSuccessfullModal(true);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    setIdExistError("");
  };

  const handleFinanceDelete = (finance: FinanceTableData) => {
    const updatingList = financeList.filter(i => i.FinanceId !== finance.FinanceId)
    setFinanceList(updatingList)
    setIsDeleteModal(null)
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto"
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
  const handleCategoryDelete = (category: FinanceCategoriesData) => {
    const updatingList = financeCategoriesList.filter(c => c.id !== category.id)
    setFinanceCategoriesList(updatingList)
    setIsDeleteCategoryModal(null)
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto"
  }

  const clearError = () => setIdExistError("");


  return (
    <FinanceContext.Provider value={{ financeList, addFinance, clearError, idExistError, successfullModal, setSuccessfullModal, editingFinance, editFinanceData, updateFinance, setEditingFinance, isDeleteModal, setIsDeleteModal, handleFinanceDelete, financeCategoriesList, editCategoryData, editingCategory, setEditingCategory, addCategory, updateFinanceCategory, isDeleteCategoryModal, setIsDeleteCategoryModal, handleCategoryDelete }}>
      {children}
    </FinanceContext.Provider>
  );
};
