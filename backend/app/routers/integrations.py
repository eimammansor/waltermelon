from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.services.database import get_db
from app.models import Integration as IntegrationModel
from app.schemas.integration import Integration, IntegrationCreate, HealthCheckResponse

router = APIRouter()

@router.get("/", response_model=List[Integration])
async def get_integrations(db: Session = Depends(get_db)):
    integrations = db.query(IntegrationModel).all()
    return integrations

@router.get("/{integration_id}", response_model=Integration)
async def get_integration(integration_id: int, db: Session = Depends(get_db)):
    integration = db.query(IntegrationModel).filter(IntegrationModel.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration

@router.post("/", response_model=Integration)
async def create_integration(integration: IntegrationCreate, db: Session = Depends(get_db)):
    db_integration = IntegrationModel(**integration.dict())
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    return db_integration

@router.put("/{integration_id}", response_model=Integration)
async def update_integration(
    integration_id: int,
    integration_update: dict,
    db: Session = Depends(get_db)
):
    db_integration = db.query(IntegrationModel).filter(IntegrationModel.id == integration_id).first()
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    for key, value in integration_update.items():
        if hasattr(db_integration, key):
            setattr(db_integration, key, value)

    db.commit()
    db.refresh(db_integration)
    return db_integration

@router.delete("/{integration_id}")
async def delete_integration(integration_id: int, db: Session = Depends(get_db)):
    db_integration = db.query(IntegrationModel).filter(IntegrationModel.id == integration_id).first()
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    db.delete(db_integration)
    db.commit()
    return {"message": "Integration deleted successfully"}

@router.post("/{integration_id}/health", response_model=HealthCheckResponse)
async def health_check_integration(integration_id: int, db: Session = Depends(get_db)):
    integration = db.query(IntegrationModel).filter(IntegrationModel.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    # Mock health check - in real implementation, this would test the actual service
    # For now, just return a mock response based on connection status
    if integration.is_connected:
        health_response = HealthCheckResponse(
            status="healthy",
            message=f"{integration.service_name} is connected and responding",
            details={
                "service": integration.service_name,
                "auth_type": integration.auth_type,
                "last_check": datetime.utcnow().isoformat()
            },
            timestamp=datetime.utcnow()
        )
    else:
        health_response = HealthCheckResponse(
            status="unhealthy",
            message=f"{integration.service_name} is not connected",
            details={
                "service": integration.service_name,
                "auth_type": integration.auth_type,
                "error": "Service not configured or connection failed"
            },
            timestamp=datetime.utcnow()
        )

    return health_response