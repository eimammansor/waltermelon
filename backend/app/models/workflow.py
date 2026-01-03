from sqlalchemy import Column, Integer, String, JSON, Boolean
from app.services.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    trigger_type = Column(String, nullable=False) # webhook, schedule, event
    definition = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)