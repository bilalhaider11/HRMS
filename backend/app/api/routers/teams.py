from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.services import admin_db
from app.services import auth
from app.services import teams_db
router = APIRouter(prefix="/admin", dependencies=[Depends(auth.get_current_user)])


@router.post("/create_team")
def create_team(
    payload: dict,
    current_user: auth.Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.create_team_in_db(payload, company_id=current_user.id, session=session)


@router.get("/get_teams")
def get_teams(
    current_user: auth.Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.get_teams_in_db(company_id=current_user.id, session=session)


@router.get("/get_team/{team_id}")
def get_team(
    team_id: int,
    current_user: auth.Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.get_team_by_id_in_db(team_id, company_id=current_user.id, session=session)


@router.patch("/update_team/{team_id}")
def update_team(
    team_id: int,
    payload: dict,
    current_user: auth.Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.update_team_in_db(team_id, payload, company_id=current_user.id, session=session)


@router.delete("/delete_team/{team_id}")
def delete_team(
    team_id: int,
    current_user: auth.Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return teams_db.delete_team_in_db(team_id, company_id=current_user.id, session=session)
