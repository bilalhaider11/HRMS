from sqlmodel import Session, create_engine
from app.core.load_env import get_database_url

engine = create_engine(get_database_url(), echo=True)


def get_session():
    with Session(engine) as session:
        yield session
