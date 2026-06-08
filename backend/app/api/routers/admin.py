import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.services import admin_db,login_service
from app.services import auth
from app.models.admin import Admin, AdminProfileUpdate, AdminPasswordUpdate

router = APIRouter(prefix="/admin")


@router.post("/login", status_code=200)
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(admin_db.get_session),
    request: Request = None,
):
    return login_service.login(session,form_data,request,Admin)
    


@router.get("/company_profile")
def get_company_profile(current_user: Admin = Depends(auth.get_current_user)):
    return {
        "company_name": current_user.company_name,
        "website": current_user.website,
        "address": current_user.address,
        "phone": current_user.phone,
        "email": current_user.email,
        "access_key": current_user.access_key or "",
    }


@router.patch("/update_company_profile")
def update_company_profile(
    profile: AdminProfileUpdate,
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    return admin_db.update_company_profile_in_db(profile, current_user, session)


@router.patch("/update_password")
def update_password(
    passwords: AdminPasswordUpdate,
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    if not auth.verify_password(passwords.old_password, current_user.password):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    return admin_db.update_password_in_db(passwords.new_password, current_user, session)


@router.patch("/update_access_key")
def update_access_key(
    payload: dict,
    current_user: Admin = Depends(auth.get_current_user),
    session: Session = Depends(admin_db.get_session),
):
    new_key = payload.get("access_key", "").strip()
    if not new_key:
        raise HTTPException(status_code=400, detail="Access key cannot be empty")
    current_user.access_key = new_key
    session.add(current_user)
    session.commit()
    return {"message": "Access key updated successfully"}


@router.post("/upload_profile_pic")
def upload_profile_pic(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="File type not allowed. Use JPG, PNG, GIF, SVG, or WebP.")

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = f"uploads/profile_pics/{filename}"

    with open(filepath, "wb") as f:
        f.write(file.file.read())

    return {"url": f"/uploads/profile_pics/{filename}"}
