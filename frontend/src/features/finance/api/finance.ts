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

export interface FinanaceListData {
    financeAllList: FinanceTableData[]
}

export interface FinanceCategoriesData {
  id?: string;
  name: string;
  colorCode?: string,
  companyId?: number
}

export interface FinanceCategoriesList {
  financeCategories: FinanceCategoriesData[]
}

export const fetchFinanceTableData = async (): Promise<FinanaceListData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/finance_json_data/financeList.json"
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchFinanceCategoriesData = async (): Promise<FinanceCategoriesList> => {
  try {
    const response = await fetch(
      "/dummy_json_data/finance_json_data/financeCategories.json"
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
