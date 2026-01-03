from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from datetime import datetime
from app.services.database import Base

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String, nullable=False)  # "google_workspace", "whatsapp_business", "redis"
    is_connected = Column(Boolean, default=False)
    auth_type = Column(String)  # "api_key", "oauth", "basic", "webhook"
    api_key = Column(String)
    api_secret = Column(String)
    base_url = Column(String)
    username = Column(String)
    password = Column(String)
    oauth_token = Column(String)
    oauth_refresh_token = Column(String)
    webhook_url = Column(String)
    config = Column(JSON)  # Additional configuration as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)