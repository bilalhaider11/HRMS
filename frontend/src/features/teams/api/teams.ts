import api from "api/axios";

export interface TeamMemberApi {
  id: number;
  employee_code: string;
  name: string;
}

export interface TeamApi {
  team_id: number;
  team_name: string;
  team_description: string;
  team_lead_id: number | null;
  team_lead_name: string | null;
  team_members: TeamMemberApi[];
}

export interface TeamPayload {
  team_name: string;
  team_description: string;
  team_lead_id: number | null;
  member_ids: number[];
}

export type TeamUpdatePayload = Partial<Omit<TeamPayload, 'member_ids'> & {
  member_ids: number[];
}>;

export interface TeamEmployee {
  id: number;
  employee_code: string;
  name: string;
}

export async function fetchTeamsTableData(): Promise<TeamApi[]> {
  const res = await api.get("/admin/get_teams");
  return res.data.teams || [];
}

export async function fetchTeamById(teamId: number): Promise<TeamApi> {
  const res = await api.get(`/admin/get_team/${teamId}`);
  return res.data.team;
}

export async function createTeam(payload: TeamPayload): Promise<TeamApi> {
  const res = await api.post("/admin/create_team", payload);
  return res.data.team;
}

export async function updateTeamById(teamId: number, payload: TeamUpdatePayload): Promise<TeamApi> {
  const res = await api.patch(`/admin/update_team/${teamId}`, payload);
  return res.data.team;
}

export async function deleteTeamById(teamId: number): Promise<void> {
  await api.delete(`/admin/delete_team/${teamId}`);
}

export async function fetchEmployeesForTeams(): Promise<TeamEmployee[]> {
  const res = await api.get("/admin/display_all_employees", {
    params: { page: 1, page_size: 10, status: "active" },
  });
  return (res.data.employees || []).map((emp: any) => ({
    id: emp.id,
    employee_code: emp.employee_code,
    name: emp.name,
  }));
}

