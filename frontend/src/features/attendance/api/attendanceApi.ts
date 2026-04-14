import api from "api/axios";

export async function fetchAttendanceRecords(
  page = 1,
  pageSize = 50,
  startDate?: string,
  endDate?: string,
  search?: string,
  status?: number,
) {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (search) params.search = search;
  if (status !== undefined) params.status = status;
  const res = await api.get("/admin/attendance_records", { params });
  return res.data;
}
