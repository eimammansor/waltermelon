from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.services.database import Base

class TaskLog(Base):
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    status = Column(String)        # "success", "failed", "running"
    message = Column(String)       # Error details or summary
    timestamp = Column(DateTime(timezone=True), server_default=func.now())