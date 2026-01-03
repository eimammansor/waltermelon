from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class IntegrationBase(BaseModel):
    service_name: str
    auth_type: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    base_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    oauth_token: Optional[str] = None
    oauth_refresh_token: Optional[str] = None
    webhook_url: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class IntegrationCreate(IntegrationBase):
    pass

class Integration(IntegrationBase):
    id: int
    is_connected: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class HealthCheckResponse(BaseModel):
    status: str  # "healthy" or "unhealthy"
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime