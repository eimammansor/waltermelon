from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from app.services.database import Base

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    trigger_type = Column(String, nullable=False)
    trigger_config = Column(Text)
    actions = Column(Text)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)