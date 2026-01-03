from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from app.services.database import Base

class TaskLog(Base):
    __tablename__ = "task_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, nullable=True)
    status = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    execution_data = Column(Text, nullable=True)