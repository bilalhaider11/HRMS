import api from "api/axios";

// --- Finance Records ---

export async function fetchFinanceRecords(page = 1, pageSize = 10, startDate?: string, endDate?: string, categoryId?: number) {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (categoryId) params.category_id = categoryId;

  const res = await api.get("/finance/get_finance_records", { params });
  return res.data;
}

export async function createFinanceRecord(data: {
  date: string;
  description: string;
  amount: number;
  tax_deductions: number;
  cheque_number: string;
  category_id: number;
}) {
  const res = await api.post("/finance/create_finance_record", data);
  return res.data;
}

export async function updateFinanceRecord(financeId: number, data: Record<string, any>) {
  const res = await api.patch(`/finance/edit_finance_record?finance_id=${financeId}`, data);
  return res.data;
}

// --- Finance Categories ---

export async function fetchFinanceCategories() {
  const res = await api.get("/finance/get_all_categories");
  return res.data;
}

export async function createFinanceCategory(categoryName: string, colorCode: string) {
  const res = await api.post("/finance/create_category", {
    category_name: categoryName,
    color_code: colorCode,
  });
  return res.data;
}

export async function updateFinanceCategory(categoryId: number, categoryName: string, colorCode: string) {
  const res = await api.patch(`/finance/update_category/${categoryId}`, {
    category_name: categoryName,
    color_code: colorCode,
  });
  return res.data;
}

export async function deleteFinanceCategory(categoryId: number) {
  const res = await api.delete(`/finance/delete_category/${categoryId}`);
  return res.data;
}
