from typing import Optional
from sqlalchemy import update

from fastapi import HTTPException
from sqlmodel import Session, select, delete

from models import Team, TeamMember, Employee


def _serialize_team(team: Team, session: Session) -> dict:
    team_lead_name = None
    if team.team_lead_id is not None:
        lead = session.get(Employee, team.team_lead_id)
        team_lead_name = lead.name if lead else None

    member_links = session.exec(
        select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.delete_record == False)
    ).all()
    members = []
    for link in member_links:
        member = session.get(Employee, link.employee_id)
        if member:
            members.append(
                {
                    "id": member.id,
                    "employee_code": member.employee_code,
                    "name": member.name,
                }
            )

    return {
        "team_id": team.id,
        "team_name": team.team_name,
        "team_description": team.team_description,
        "team_lead_id": team.team_lead_id,
        "team_lead_name": team_lead_name,
        "company_id": team.company_id,
        "team_members": members,
    }


def create_team_in_db(payload: dict, company_id: int, session: Session):
    team_name = (payload.get("team_name") or "").strip()
    if not team_name:
        raise HTTPException(status_code=400, detail="team_name is required")

    team_description = payload.get("team_description")
    team_lead_id = payload.get("team_lead_id")
    member_ids = payload.get("member_ids", [])

    if team_lead_id is not None and session.get(Employee, team_lead_id) is None:
        raise HTTPException(status_code=404, detail="Team lead employee not found")

    team = Team(
        team_name=team_name,
        team_description=team_description,
        team_lead_id=team_lead_id,
        company_id=company_id,
    )
    session.add(team)
    session.commit()
    session.refresh(team)

    unique_member_ids = list(dict.fromkeys(member_ids or []))
    for employee_id in unique_member_ids:
        if session.get(Employee, employee_id) is None:
            raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")
        session.add(TeamMember(team_id=team.id, employee_id=employee_id))

    session.commit()
    return {"message": "Team created successfully", "team": _serialize_team(team, session)}


def get_teams_in_db(company_id: Optional[int], session: Session):
    query = select(Team)
    if company_id is not None:
        query = query.where(Team.company_id == company_id,Team.delete_record == False)

    teams = session.exec(query).all()
    return {"teams": [_serialize_team(team, session) for team in teams]}


def get_team_by_id_in_db(team_id: int, company_id: int, session: Session):
    team = session.get(Team, team_id)
    if not team or team.company_id != company_id:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"team": _serialize_team(team, session)}


def update_team_in_db(team_id: int, payload: dict, company_id: int, session: Session):
    team = session.get(Team, team_id)
    if not team or team.company_id != company_id:
        raise HTTPException(status_code=404, detail="Team not found")

    # ------------------ Update team fields ------------------
    if "team_name" in payload:
        team_name = (payload.get("team_name") or "").strip()
        if not team_name:
            raise HTTPException(status_code=400, detail="team_name cannot be empty")
        team.team_name = team_name

    if "team_description" in payload:
        team.team_description = payload.get("team_description")

    if "team_lead_id" in payload:
        team_lead_id = payload.get("team_lead_id")
        if team_lead_id is not None and not session.get(Employee, team_lead_id):
            raise HTTPException(status_code=404, detail="Team lead employee not found")
        team.team_lead_id = team_lead_id

    session.add(team)

    # ------------------ Member toggle logic ------------------
    if "member_ids" in payload:
        incoming_ids = set(payload.get("member_ids") or [])

        # get current active members
        current_members = session.exec(
            select(TeamMember).where(
                TeamMember.team_id == team.id,
                TeamMember.delete_record == False
            )
        ).all()

        current_map = {m.employee_id: m for m in current_members}
        
        add_members = []
        remove_members = []

        for emp_id in incoming_ids:

            if emp_id in current_map:
                remove_members.append(emp_id)  
            else:
                add_members.append(emp_id)
            
            
        if remove_members:
            session.exec(
                update(TeamMember)
                .where(
                    TeamMember.team_id == team.id,
                    TeamMember.employee_id.in_(remove_members)
                )
                .values(delete_record=True)
            )
        if add_members:
            session.add_all([
                TeamMember(
                    team_id=team.id,
                    employee_id=emp_id,
                    delete_record=False
                )
                for emp_id in add_members
            ])
        
    session.commit()
    session.refresh(team)

    return {
        "message": "Team updated successfully",
        "team": _serialize_team(team, session)
    }
    
    
def delete_team_in_db(team_id: int, company_id: int, session: Session):
    team = session.get(Team, team_id)

    if not team or team.company_id != company_id:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team.delete_record = True
    # soft delete members (bulk query)
    session.exec(
        update(TeamMember)
        .where(TeamMember.team_id == team.id)
        .values(delete_record=True)
    )
    session.commit()

    return {"message": "Team deleted successfully"}