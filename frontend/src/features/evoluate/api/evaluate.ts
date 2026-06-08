import api from "api/axios";
import {EvaluationEmployee, EvaluationItem, EvaluationPayload} from "../modal/evaluate_context"

export async function fetchEvaluationEmployees(): Promise<{
  scope: string;
  employees: EvaluationEmployee[];
}> {
  const res = await api.get("/evaluation/employees");
  return res.data || { scope: "self", employees: [] };
}

export async function fetchEmployeeEvaluations(empId: number): Promise<{
  employee?: EvaluationEmployee;
  evaluations: EvaluationItem[];
}> {
  const response = await api.get(`/evaluation/evaluate/${empId}`);
  return response.data || { evaluations: [] };
}

export async function postEmployeeEvaluation(empId: number, evaluationData: EvaluationPayload): Promise<void> {
  await api.post(`/evaluation/evaluate/${empId}`, evaluationData);
}

export async function updateEmployeeEvaluation(
  empId: number,
  evaluationId: number,
  evaluationData: Partial<EvaluationPayload>
): Promise<void> {
  await api.patch(`/evaluation/update-evaluation/${empId}?evaluation_id=${evaluationId}`, evaluationData);
}

export async function deleteEmployeeEvaluation(empId: number, evaluationId: number): Promise<void> {
  await api.delete(`/evaluation/delete-evaluation/${empId}?evaluation_id=${evaluationId}`);
}