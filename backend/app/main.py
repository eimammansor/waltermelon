from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.database import engine, SessionLocal
from app.services.scheduler import scheduler_service
from app.models.workflow import Workflow
from app.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware
from app.routers import workflows
from app.models.task_log import TaskLog

app = FastAPI(title="Automation Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development; narrow this to your frontend IP later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize DB tables on startup
@app.on_event("startup")
def on_startup():
    #Ensure DB tables are created
    init_db()

    ##Start the scheduler
    db = SessionLocal()
    try:
        # Load all active workflows into the scheduler
        active_workflows = db.query(Workflow).filter(Workflow.is_active == True).all()
        for wf in active_workflows:
            if "schedule" in wf.definition:
                scheduler_service.add_workflow_job(wf)
        print(f"✅ Scheduler started: {len(active_workflows)} jobs loaded.")
    finally:
        db.close()
    

# 1. Health Check Endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "device": "Raspberry Pi 5", "usage": "lightweight"}

@app.on_event("shutdown")
def shutdown_event():
    # Gracefully shut down the scheduler
    scheduler_service.shutdown()
    print("🛑 Scheduler shut down.")

@app.get("/api/logs")
def get_logs(db: Session = Depends(get_db)): # Changed from database.get_db to get_db
    # Now that TaskLog is imported, let's actually try to fetch them!
    try:
        logs = db.query(TaskLog).order_by(TaskLog.timestamp.desc()).limit(50).all()
        return logs
    except Exception:
        return []

app.include_router(workflows.router)

