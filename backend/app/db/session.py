from sqlmodel import Session, create_engine
from app.core.load_env import get_database_url



def get_session():
    engine = create_engine(get_database_url(), echo=True)
    with Session(engine) as session:
        yield session
