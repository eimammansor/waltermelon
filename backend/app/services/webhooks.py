from app.services.executor import execute_workflow

@router.post("/{workflow_id}/trigger")
async def manual_trigger(workflow_id: int):
    """Manually trigger a workflow via API/Webhook"""
    # In a real app, you'd move this to a background task
    # so the API responds instantly.
    execute_workflow(workflow_id)
    return {"message": f"Workflow {workflow_id} triggered successfully"}