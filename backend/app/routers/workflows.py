from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.services.database import get_db
from app.models import Workflow as WorkflowModel, TaskLog as TaskLogModel
from app.schemas import (
    Workflow as WorkflowSchema,
    WorkflowCreate,
    WorkflowUpdate
)

router = APIRouter()

@router.get("/", response_model=List[WorkflowSchema])
async def get_workflows(db: Session = Depends(get_db)):
    workflows = db.query(WorkflowModel).all()
    return workflows

@router.get("/{workflow_id}", response_model=WorkflowSchema)
async def get_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/", response_model=WorkflowSchema)
async def create_workflow(workflow: WorkflowCreate, db: Session = Depends(get_db)):
    db_workflow = WorkflowModel(**workflow.model_dump())
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@router.patch("/{workflow_id}", response_model=WorkflowSchema)
async def update_workflow(
    workflow_id: int, 
    workflow: WorkflowUpdate, 
    db: Session = Depends(get_db)
):
    db_workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    for key, value in workflow.model_dump(exclude_unset=True).items():
        setattr(db_workflow, key, value)
    
    db_workflow.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    db_workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    db.delete(db_workflow)
    db.commit()
    return {"message": "Workflow deleted successfully"}

@router.post("/{workflow_id}/trigger")
async def trigger_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Create success log
    log = TaskLogModel(
        workflow_id=workflow_id, 
        status="success",
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    
    return {
        "message": f"Workflow '{workflow.name}' triggered successfully", 
        "workflow_id": workflow_id
    }