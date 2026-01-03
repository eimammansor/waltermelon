from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Optional[str] = None
    actions: Optional[str] = None
    enabled: bool = True

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[str] = None
    actions: Optional[str] = None

class Workflow(WorkflowBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Task Log Schemas
class TaskLogBase(BaseModel):
    workflow_id: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    execution_data: Optional[str] = None

class TaskLog(TaskLogBase):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)