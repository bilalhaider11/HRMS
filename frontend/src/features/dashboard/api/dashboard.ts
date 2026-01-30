import { JSX } from "react/jsx-runtime";

export interface Card {
  image: string;
  amount: string;
  percentageUpIcon: string;
  percentage_up_this_week: string;
  period: string;
}

export interface CardData {
  cards: Card[];
}

export interface Token {
  tokenName: string;
}

export interface BasisStatistic {
  title: string;
  value: string;
  color: string;
  width: string;
  radius: number;
  dashArray: number;
  progress: number;
  startX: number;
  endX: number;
}

export interface MarketStatsData {
  tokens: Token[];
  labels: string[];
  labels2: string[];
  line1: number[];
  line2: number[];
  basisStatistics: BasisStatistic[];
}

export interface Minute {
  timeValue: string;
  value: string;
  value_progress_percentage: string;
  labels: string[];
  line: number[];
}

export interface PortfolioData {
  minutes: Minute[];
}

export interface TableData {
  image: string;
  title: string;
  shortTitle: string;
  value: string;
  profit_loss_value: string;
  profit_loss_percentage: string;
  labels: string[];
}

export interface HoldingData {
  tableData: TableData[];
}

export interface WatchlistTableData {
  coinImg: string;
  title: string;
  duration: string;
  value: string;
  percentage_value: string;
  percentage_plus_minus: string;
  labels: string[];
  lineColor: string;
}

export interface WatchlistData {
  watchlistTableData: WatchlistTableData[];
}

export interface TransactionTableData {
  coinImg: string;
  title: string;
  subTitle: string;
  actionStatus: string;
  date: string;
  time: string;
  units: string;
  price: string;
  total: string;
  weekly: string;
}

export interface TransactionData {
  transactionTableData: TransactionTableData[];
}

export interface EmployeeTableData {
  name: string;
  status: string;
}

export interface EmployeeListData {
  employeesList: EmployeeTableData[]
}


export const fetchCardData = async (): Promise<CardData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/dashboard_json_data/card.json"
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

export const fetchMarketStatsData = async (): Promise<MarketStatsData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/dashboard_json_data/MarketStats.json"
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

export const fetchPortfolioData = async (): Promise<PortfolioData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/dashboard_json_data/portfolio_data.json"
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

export const fetchHoldingData = async (): Promise<HoldingData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/dashboard_json_data/holding_data.json"
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


export const fetchWatchlistData = async (): Promise<WatchlistData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/dashboard_json_data/watchlist_data.json"
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


export const fetchTransactionData = async (): Promise<TransactionData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/dashboard_json_data/transaction_data.json"
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

export const fetchEmploeeTableData = async (): Promise<EmployeeListData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/employees_json_data/employeeslist.json"
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
