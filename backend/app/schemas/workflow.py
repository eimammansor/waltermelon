from pydantic import BaseModel
from typing import Optional, Dict, Any

class WorkflowBase(BaseModel):
    name: str
    trigger_type: str
    definition: Dict[str, Any]  # The logic tree
    is_active: Optional[bool] = True

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowRead(WorkflowBase):
    id: int

    class Config:
        from_attributes = True