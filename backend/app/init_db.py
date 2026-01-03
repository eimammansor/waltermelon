from app.services.database import engine, Base
from app.models import workflow, task_log, integration

def init_db():
    # Create all tables in the SQLite database
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()