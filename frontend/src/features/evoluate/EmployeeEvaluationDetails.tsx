import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VerifyContext } from "app/VerifyContext";

import {
  deleteEmployeeEvaluation,
  fetchEmployeeEvaluations,
  postEmployeeEvaluation,
  updateEmployeeEvaluation,
} from "./api/evaluate";

import {
  EvaluationItem,
  EvaluationPayload
} from "./modal/evaluate_context"

const EMPTY_FORM: EvaluationPayload = {
  task_completion: 0,
  team_player: 0,
  time_management: 0,
  positive_work_attitide: 0,
  adaptable_and_flexible: 0,
  ability_to_learn: 0,
  problem_solving: 0,
  punctuality: 0,
  general_comments: "",
  extra_comments: "",
};

const SCORE_FIELDS: Array<keyof EvaluationPayload> = [
  "task_completion",
  "team_player",
  "time_management",
  "positive_work_attitide",
  "adaptable_and_flexible",
  "ability_to_learn",
  "problem_solving",
  "punctuality",
];

const SCORE_FIELD_LABELS: Record<keyof EvaluationPayload, string> = {
  task_completion: "Task Completion",
  team_player: "Team Player",
  time_management: "Time Management",
  positive_work_attitide: "Positive Work Attitude",
  adaptable_and_flexible: "Adaptable & Flexible",
  ability_to_learn: "Ability To Learn",
  problem_solving: "Problem Solving",
  punctuality: "Punctuality",
  general_comments: "General Comments",
  extra_comments: "Extra Comments",
};


const ScaleRemarks = {
  1: "Unsatisfactory",
  2: "Satisfactory",
  3: "Average",
  4: "Above Average",
  5: "Exceptional"
}

const toScore = (value: string): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(5, Math.max(0, parsed));
};

export default function EmployeeEvaluationDetails() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { superAdmin, user } = useContext(VerifyContext);
  const [employeeName, setEmployeeName] = useState("");
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [form, setForm] = useState<EvaluationPayload>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvaluationId, setEditingEvaluationId] = useState<number | null>(null);

  const numericEmployeeId = Number(employeeId || 0);
  const roleNames = user?.roles || [];
  const canCreate = (superAdmin || roleNames.includes("HR") || roleNames.includes("Team Lead")) && numericEmployeeId != user?.id;
  const canEditDelete = superAdmin;

  const loadEvaluations = async () => {
    if (!numericEmployeeId) return;
    setLoading(true);
    setMessage("");
    try {
      const data = await fetchEmployeeEvaluations(numericEmployeeId);
      setEvaluations(data.evaluations || []);
      setEmployeeName(data.employee?.name || `Employee #${numericEmployeeId}`);
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to load evaluations.");
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericEmployeeId]);

  const resetModal = () => {
    setShowCreateModal(false);
    setEditingEvaluationId(null);
    setForm(EMPTY_FORM);
  };

  const openCreateModal = () => {
    setEditingEvaluationId(null);
    setForm(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const openEditModal = (evaluation: EvaluationItem) => {
    if (!canEditDelete) return;
    setEditingEvaluationId(evaluation.evaluation_id);
    setForm({
      task_completion: evaluation.task_completion,
      team_player: evaluation.team_player,
      time_management: evaluation.time_management,
      positive_work_attitide: evaluation.positive_work_attitide,
      adaptable_and_flexible: evaluation.adaptable_and_flexible,
      ability_to_learn: evaluation.ability_to_learn,
      problem_solving: evaluation.problem_solving,
      punctuality: evaluation.punctuality,
      general_comments: evaluation.general_comments || "",
      extra_comments: evaluation.extra_comments || "",
    });
    setShowCreateModal(true);
  };


  const saveEvaluation = async () => {
    if (!numericEmployeeId) return;
    const payload: EvaluationPayload = {
      ...form,
      task_completion: toScore(String(form.task_completion)),
      team_player: toScore(String(form.team_player)),
      time_management: toScore(String(form.time_management)),
      positive_work_attitide: toScore(String(form.positive_work_attitide)),
      adaptable_and_flexible: toScore(String(form.adaptable_and_flexible)),
      ability_to_learn: toScore(String(form.ability_to_learn)),
      problem_solving: toScore(String(form.problem_solving)),
      punctuality: toScore(String(form.punctuality)),
    };

    setSubmitting(true);
    setMessage("");
    try {
      if (editingEvaluationId) {
  
        await updateEmployeeEvaluation(numericEmployeeId, editingEvaluationId, payload);
      } else {
        await postEmployeeEvaluation(numericEmployeeId, payload);
      }
      resetModal();
      await loadEvaluations();
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to save evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (evaluationId: number) => {
    if (!canEditDelete || !numericEmployeeId) return;
    setSubmitting(true);
    setMessage("");
    try {
      await deleteEmployeeEvaluation(numericEmployeeId, evaluationId);
      await loadEvaluations();
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to delete evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-4">

      {canCreate && <button
        className="text-sm text-indigo-300 hover:text-indigo-200"
        onClick={() => navigate("/employee-evaluation")}
      >
        Back to employees
      </button>
      }

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-white">{employeeName} Evaluations</h1>
          {canCreate && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
            >
              Create Evaluation
            </button>
          )}
        </div>
        {loading && <p className="text-slate-400 text-sm">Loading evaluations...</p>}
        {!loading && evaluations.length === 0 && (
          <p className="text-slate-400 text-sm">No evaluations available.</p>
        )}
        {evaluations.length > 0 && (
          <div className="overflow-x-auto border border-slate-700 rounded-lg">
            <table className="min-w-full text-sm text-slate-200">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left">Task Completion</th>
                  <th className="px-3 py-2 text-left">Team Player</th>
                  <th className="px-3 py-2 text-left">Time Management</th>
                  <th className="px-3 py-2 text-left">Work Attitude</th>
                  <th className="px-3 py-2 text-left">Adaptability</th>
                  <th className="px-3 py-2 text-left">Learning Ability</th>
                  <th className="px-3 py-2 text-left">Problem Solving</th>
                  <th className="px-3 py-2 text-left">Punctuality</th>
                  <th className="px-3 py-2 text-left">General Comments</th>
                  <th className="px-3 py-2 text-left">Extra Comments</th>
                  {canEditDelete && <th className="px-3 py-2 text-left">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation) => (
                  <tr key={evaluation.evaluation_id} className="border-t border-slate-700 align-top">
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.task_completion as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.team_player as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.time_management as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.positive_work_attitide as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.adaptable_and_flexible as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.ability_to_learn as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.problem_solving as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2">{ScaleRemarks[evaluation.punctuality as keyof typeof ScaleRemarks]}</td>
                    <td className="px-3 py-2 whitespace-pre-wrap min-w-[200px]">
                      {evaluation.general_comments || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-pre-wrap min-w-[200px]">
                      {evaluation.extra_comments || "-"}
                    </td>
                    {canEditDelete && (
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-xs bg-amber-600 rounded text-white"
                            onClick={() => openEditModal(evaluation)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 text-xs bg-red-600 rounded text-white"
                            onClick={() => handleDelete(evaluation.evaluation_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {message && <p className="mt-3 text-sm text-rose-300">{message}</p>}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">
                {editingEvaluationId ? "Update Evaluation" : "Create Evaluation"}
              </h2>
              <button className="text-slate-300" onClick={resetModal}>
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SCORE_FIELDS.map((field) => (
                <label key={field} className="text-sm text-slate-300 flex flex-col gap-1">
                  {SCORE_FIELD_LABELS[field]}
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={1}
                    value={form[field] as number}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field]: toScore(e.target.value) }))
                    }
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <textarea
                value={form.general_comments}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, general_comments: e.target.value }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                placeholder="General comments"
              />
              <textarea
                value={form.extra_comments}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, extra_comments: e.target.value }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                placeholder="Extra comments"
              />
            </div>
            <button
              disabled={submitting}
              onClick={saveEvaluation}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : editingEvaluationId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}