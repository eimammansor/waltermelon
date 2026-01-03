from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.services.database import get_db
from app.models.workflow import Workflow
from app.schemas.workflow import WorkflowCreate, WorkflowRead
from app.services.scheduler import scheduler_service

router = APIRouter(prefix="/api/workflows", tags=["Workflows"])

@router.get("/", response_model=List[WorkflowRead])
def list_workflows(db: Session = Depends(get_db)):
    return db.query(Workflow).all()

@router.get("/{id}", response_model=WorkflowRead)
def get_workflow(id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/", response_model=WorkflowRead)
def create_workflow(workflow: WorkflowCreate, db: Session = Depends(get_db)):
    db_workflow = Workflow(**workflow.dict())
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@router.delete("/{id}")
def delete_workflow(id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(workflow)
    db.commit()
    return {"message": "Workflow deleted"}

@router.post("/{workflow_id}/trigger")
def trigger_workflow(workflow_id: int, db: Session = Depends(get_db)):
    db_workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        scheduler_service.run_workflow_now(db_workflow)
        return {"status": "success", "message": f"Workflow '{db_workflow.name}' triggered manually."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger: {str(e)}")