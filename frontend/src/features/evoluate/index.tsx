import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VerifyContext } from "app/VerifyContext";
import { fetchEvaluationEmployees } from "./api/evaluate";
import { EvaluationEmployee } from "./modal/evaluate_context"
import {verify} from "../auth/api/auth"


export default function EmployeeEvaluationPage() {
  const { user } = useContext(VerifyContext);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EvaluationEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState("self");
  const [message, setMessage] = useState("");

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchEvaluationEmployees();
      setScope(data.scope || "self");
      setEmployees(data.employees || []);
      if ((data.scope === "self" || !(user?.roles || []).length) && (data.employees || []).length === 1) {
        navigate(`/employee-evaluation/${data.employees[0].id}`, { replace: true });
      }
    } catch (error) {
      setMessage("Unable to load employees for evaluation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Employee Evaluation</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select an employee to see their evaluations.
        </p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-lg font-semibold">Employees</h2>
          <span className="text-xs text-slate-400 uppercase">{scope}</span>
        </div>
        {loading && <p className="text-slate-400 text-sm">Loading employees...</p>}
        {!loading && employees.length === 0 && (
          <p className="text-slate-400 text-sm">No employees available for evaluation.</p>
        )}
        <div className="space-y-2">
          {employees.map((employee) => (
            <button
              key={employee.id}
              className="w-full text-left rounded-lg px-3 py-2 border bg-slate-800 border-slate-700 text-slate-200 hover:border-indigo-500"
              onClick={() => navigate(`/employee-evaluation/${employee.id}`)}
            >
              <p className="font-medium">{employee.name}</p>
              <p className="text-xs text-slate-400">
                {employee.employee_code}
              </p>
            </button>
          ))}
        </div>
        {message && <p className="mt-3 text-sm text-rose-300">{message}</p>}
      </div>
    </div>
  );
}
