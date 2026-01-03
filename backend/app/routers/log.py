from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.services.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.workflow.TaskLog])
async def get_logs(db: Session = Depends(get_db)):
    return db.query(models.TaskLog).order_by(models.TaskLog.started_at.desc()).limit(100).all()