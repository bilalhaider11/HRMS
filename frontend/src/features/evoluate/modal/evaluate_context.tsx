
//{
//        "task_completion": 2,
//        "team_player": 3,
//        "time_management": 5,
//        "positive_work_attitide": 1,
//        "adaptable_and_flexible": 3,
//        "ability_to_learn": 4,
//        "problem_solving": 5,
//        "punctuality": 2,
//        "extra_comments": "keep it up"
//}

//form data

export interface EvaluationPayload {
  task_completion: number;
  team_player: number;
  time_management: number;
  positive_work_attitide: number;
  adaptable_and_flexible: number;
  ability_to_learn: number;
  problem_solving: number;
  punctuality: number;
  general_comments: string;
  extra_comments?: string;
  created_at?:string
}

//employee evaluate
export interface EvaluationEmployee {
  id: number;
  employee_code: string;
  name: string;
  email: string;
}

//overall data of emp-evaluate
export interface EvaluationItem {
  evaluation_id: number;
  employee_id: number;
  employee_name: string;
  task_completion: number;
  team_player: number;
  time_management: number;
  positive_work_attitide: number;
  adaptable_and_flexible: number;
  ability_to_learn: number;
  problem_solving: number;
  punctuality: number;
  general_comments: string;
  extra_comments?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
//employee evaluation sidebar can only view for employee role HR and eam Lead and Admin hide Employees evaluation for simple employee
//table data
export interface EvaluateEmployeeData {
    empId?: number,
    EvaId?: number,
    taskCompletion?: number,
    teamPlayer?: number,
    timeManagement?: number,
    positiveWorkAttitude?: number,
    adaptableAndFlexible?: number,
    abilityToLearn?: number,
    problemSolving?: number,
    punctuality?: number,
    generalComments?: string,
    extraComments?: string
}
