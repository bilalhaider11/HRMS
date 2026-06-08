from fastapi import HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.services import admin_db
from app.services import auth


def login(
    session: Session,
    form_data: OAuth2PasswordRequestForm,
    request: Request,
    model_cls: type,
    *,
    extra_jwt_claims: dict | None = None,
):
    user = session.exec(
        select(model_cls).where(model_cls.email == form_data.username)
    ).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload: dict = {"user_id": user.id}
    if extra_jwt_claims:
        payload.update(extra_jwt_claims)

    token = auth.create_access_token(data=payload)
    client_ip = request.client.host if request and request.client else "unknown"
    admin_db.add_jwt_token_in_db(client_ip, token, session)
    return {"access_token": token, "token_type": "bearer"}
