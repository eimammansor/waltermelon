from app.services.database import engine, Base, get_db
from app.models import workflow, task_log, integration
from sqlalchemy.orm import Session

def init_db():
    # Create all tables in the SQLite database
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")

    # Add sample integration data
    db = next(get_db())
    try:
        # Check if integrations already exist
        existing_integrations = db.query(integration.Integration).count()
        if existing_integrations == 0:
            sample_integrations = [
                integration.Integration(
                    service_name="google_workspace",
                    auth_type="oauth",
                    is_connected=False
                ),
                integration.Integration(
                    service_name="whatsapp_business",
                    auth_type="api_key",
                    is_connected=False
                ),
                integration.Integration(
                    service_name="redis",
                    auth_type="api_key",
                    is_connected=True,
                    base_url="redis://localhost:6379"
                )
            ]

            for integ in sample_integrations:
                db.add(integ)

            db.commit()
            print("Sample integrations added successfully.")
        else:
            print("Integrations already exist, skipping sample data creation.")
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()