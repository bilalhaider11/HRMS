from fastapi import HTTPException
from sqlmodel import select, Session
from models import Employee, Team, Teams_to_employee

# ---------------- CREATE TEAM ----------------
def create_team_in_db(team, session: Session):
    # Validate required fields
    if team.name == 'string':
        raise HTTPException(status_code=400, detail="Enter team name")
    if team.description == 'string':
        raise HTTPException(status_code=400, detail="Enter team description")
    if team.team_lead_id == 0:
        raise HTTPException(status_code=400, detail="Enter team lead id")
    
    # Validate team lead exists
    team_lead = session.exec(select(Employee).where(Employee.id == team.team_lead_id, Employee.status == True)).first()
    if not team_lead:
        raise HTTPException(status_code=404, detail="No employee exists with this id")
    
    # Check if team lead is already leading a team
    existing = session.exec(select(Team).where(Team.team_lead_id == team.team_lead_id)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Team lead is already leading a team")
    
    # Create the team
    team = Team.model_validate(team)
    session.add(team)
    session.commit()
    session.refresh(team)
    
    # Add relation in Teams_to_employee table
    team_to_employee = Teams_to_employee(team_id=team.id, employee_id=team_lead.id)
    session.add(team_to_employee)
    
    # Update team lead designation
    team_lead.designation = 'Team Lead'
    session.commit()
    session.refresh(team_lead)
    session.refresh(team_to_employee)
    
    return team


# ---------------- READ TEAM ----------------
def get_team_by_id_in_db(team_id, session: Session):
    team = session.exec(select(Team).where(Team.id == team_id)).first()
    if not team:
        raise HTTPException(status_code=404, detail='Team with given id does not exist.')
    return team


# ---------------- UPDATE TEAM ----------------
def edit_team_in_db(team_id, team, session: Session):
    existing = session.exec(select(Team).where(Team.id == team_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Team with given id does not exist.')
    
    # Update name/description
    if team.name != 'string':
        existing.name = team.name
    if team.description != 'string':
        existing.description = team.description
    
    if team.team_lead_id != 0 and team.team_lead_id != existing.team_lead_id:
        # Validate new lead
        new_lead = session.exec(select(Employee).where(Employee.id == team.team_lead_id, Employee.status == True)).first()
        if not new_lead:
            raise HTTPException(status_code=404, detail="No employee exists with this id")
        
        # Check if new lead is already leading another team
        other_team = session.exec(select(Team).where(Team.team_lead_id == team.team_lead_id, Team.id != team_id)).first()
        if other_team:
            raise HTTPException(status_code=409, detail="Team lead is already leading another team")
        
        # Update Teams_to_employee link
        # Remove old link
        old_link = session.exec(select(Teams_to_employee).where(
            Teams_to_employee.team_id == team_id,
            Teams_to_employee.employee_id == existing.team_lead_id
        )).first()
        if old_link:
            session.delete(old_link)
        
        # Add new link
        new_link = Teams_to_employee(team_id=team_id, employee_id=new_lead.id)
        session.add(new_link)

        # Update designations
        old_lead = session.exec(select(Employee).where(Employee.id == existing.team_lead_id)).first()
        if old_lead:
            old_lead.designation = 'Employee'
        new_lead.designation = 'Team Lead'

        existing.team_lead_id = team.team_lead_id

    session.commit()
    session.refresh(existing)
    return existing

# ---------------- DELETE TEAM ----------------
def delete_team_in_db(team_id, session: Session):
    existing = session.exec(select(Team).where(Team.id == team_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Team with given id does not exist.')
    
    # Delete relations in Teams_to_employee table
    relations = session.exec(select(Teams_to_employee).where(Teams_to_employee.team_id == existing.id)).all()
    for relation in relations:
        session.delete(relation)
    session.flush()  # Ensures DB sees relation deletions

    # Reset team lead designation
    team_lead = session.exec(select(Employee).where(Employee.id == existing.team_lead_id)).first()
    if team_lead:
        team_lead.designation = 'Employee'

    # Delete team
    session.delete(existing)
    session.commit()
    return {"message": f"Team with id {team_id} has been deleted"}