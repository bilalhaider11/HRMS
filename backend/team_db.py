from fastapi import HTTPException
from sqlmodel import select
from models import Company, Employee, Team, Teams_to_employee

# ---------------- CREATE TEAM ----------------
def create_team_in_db(team, session, current_admin):
    # Validate admin company
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company doesn't exist for admin")
    
    # Validate required fields
    if team.name == 'string':
        raise HTTPException(status_code=400, detail="Enter team name")
    if team.description == 'string':
        raise HTTPException(status_code=400, detail="Enter team description")
    if team.team_lead_id == 'string':
        raise HTTPException(status_code=400, detail="Enter team lead id")
    if team.company_id == 0:
        raise HTTPException(status_code=400, detail="Enter company id")
    if team.company_id != company.company_id:
        raise HTTPException(status_code=403, detail="Invalid company id")
    # Validate team lead exists
    team_lead = session.exec(select(Employee).where(Employee.employee_id == team.team_lead_id,
                                                    Employee.company_id == team.company_id)).first()
    if not team_lead:
        raise HTTPException(status_code=404, detail="No employee exists with this id")
    
    # Check if team lead is already leading a team
    existing = session.exec(select(Team).where(Team.team_lead_id == team.team_lead_id,
                                                Team.company_id == team.company_id)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Team lead is already leading a team")
    
    # Create the team
    team = Team.model_validate(team)
    session.add(team)
    session.commit()
    
    # Update team lead and add link
    team_lead.team = team.id
    team_lead.designation = 'Team Lead'
    team_to_employee = Teams_to_employee(team_id=team.id, team_lead_id=team_lead.id)
    session.add(team_to_employee)
    session.commit()
    
    # Refresh and return
    session.refresh(team)
    session.refresh(team_lead)
    session.refresh(team_to_employee)
    return team

# ---------------- READ TEAM ----------------
def get_team_by_id_in_db(team_id, session, current_admin):
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company doesn't exist for admin")
    
    team = session.exec(select(Team).where(Team.id == team_id,
                                            Team.company_id == company.company_id)).first()
    if not team:
        raise HTTPException(status_code=404, detail='Team with given id does not exist.')
    return team

# ---------------- UPDATE TEAM ----------------
def edit_team_in_db(team_id, team, session, current_admin):
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company doesn't exist for admin")
    
    existing = session.exec(select(Team).where(Team.id == team_id,
                                                Team.company_id == company.company_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Team with given id does not exist.')
    
    if team.name != 'string':
        existing.name = team.name
    if team.description != 'string':
        existing.description = team.description
    
    if team.team_lead_id != 0:
        # Validate team lead in correct company
        team_lead = session.exec(select(Employee).where(Employee.employee_id == team.team_lead_id,
                                                        Employee.company_id == existing.company_id)).first()
        if not team_lead:
            raise HTTPException(status_code=404, detail="No employee exists with this id")
        team_lead = session.exec(select(Team).where(Team.team_lead_id == team.team_lead_id,
                                                    Team.company_id == team.company_id)).first()
        if team_lead:
            raise HTTPException(status_code=409, detail="Team lead is already leading a team")
        existing.team_lead_id = team.team_lead_id
    
    session.commit()
    session.refresh(existing)
    return existing

# ---------------- DELETE TEAM ----------------
def delete_team_in_db(team_id, session, current_admin):
    company = session.exec(select(Company).where(Company.company_name == current_admin.company_name)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company doesn't exist for admin")
    
    existing = session.exec(select(Team).where(Team.id == team_id,
                                                Team.company_id == company.company_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Team with given id does not exist.')
    
    # Delete relation in Teams_to_employee table
    team_to_emp = session.exec(select(Teams_to_employee).where(
        Teams_to_employee.team_id == existing.id,
        Teams_to_employee.team_lead_id == existing.team_lead_id
    )).first()
    if team_to_emp:
        session.delete(team_to_emp)
    
    session.delete(existing)
    session.commit()
    return {"message": f"Team with id {team_id} has been deleted"}
