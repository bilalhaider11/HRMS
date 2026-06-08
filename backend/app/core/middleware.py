from fastapi import Request
from sqlmodel import Session
from app.services import admin_db
from app.services.admin_db import get_client_token_in_db


async def auto_auth_middleware(request: Request, call_next):
    
    if request.url.path in ["/employee/login","/admin/login"] and request.method == "POST":
        return await call_next(request)
    
    if request.url.path.startswith("/attendances/"):
        return await call_next(request)

    try:
        client_ip = request.client.host if request.client else None
        if client_ip:
            with Session(admin_db._get_engine()) as session:
                token_record = get_client_token_in_db(client_ip, session)
                if token_record:
                    request.headers.__dict__["_list"].append(
                        (b"authorization", f"Bearer {token_record}".encode())
                    )
    except Exception:
        pass

    return await call_next(request)
