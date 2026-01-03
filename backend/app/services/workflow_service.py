import json
from app.core.config import redis_client

def get_workflow_definition(workflow_id: int, db_session):
    cache_key = f"workflow_def:{workflow_id}"
    
    # 1. Try to get from Cache
    cached_wf = redis_client.get(cache_key)
    if cached_wf:
        return json.loads(cached_wf)
    
    # 2. If not in cache, get from SQLite
    workflow = db_session.query(Workflow).get(workflow_id)
    if workflow:
        # Save to Redis for next time (Expires in 1 hour)
        redis_client.setex(cache_key, 3600, json.dumps(workflow.definition))
        return workflow.definition
    return None