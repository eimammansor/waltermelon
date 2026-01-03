from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.executor import execute_with_retry 

class AutomationScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.add_job(self.cleanup_logs, 'interval', hours=24)
        self.scheduler.start()

    def run_workflow_now(self, workflow):
        """Executes a workflow immediately regardless of its schedule."""
        # This runs the same function the scheduler usually calls
        # but uses the 'add_job' with no trigger to run once, now.
        self.scheduler.add_job(
            id=f"manual_{workflow.id}",
            func=self.execute_workflow, # The function that does the actual work
            args=[workflow.id],
            replace_existing=True
        )
        print(f"🚀 Manually triggered workflow: {workflow.name}")
        
    def add_workflow_job(self, workflow):
        """Adds a job to the scheduler based on workflow definition"""
        trigger_config = workflow.definition.get("schedule", {})
        
        # Implement Cron Trigger Parsing
        # Example: {"cron": "0 9 * * *"} (Every day at 9 AM)
        if "cron" in trigger_config:
            trigger = CronTrigger.from_crontab(trigger_config["cron"])
            self.scheduler.add_job(
                execute_workflow,
                trigger=trigger,
                args=[workflow.id],
                id=f"workflow_{workflow.id}",
                replace_existing=True
            )
        pass
    
    def shutdown(self):
        """Cleanly stop the scheduler"""
        self.scheduler.shutdown(wait=False)

    def enqueue_task(self, workflow_id: int):
        """Pushes a workflow task into the Redis queue"""
        task_data = json.dumps({"workflow_id": workflow_id, "action": "execute"})
        redis_client.lpush("workflow_queue", task_data)
        print(f"📥 Enqueued workflow {workflow_id}")

    def add_workflow_job(self, workflow):
        # Update your scheduler to use the queue instead of direct execution
        self.scheduler.add_job(
            self.enqueue_task,
            trigger=CronTrigger.from_crontab(workflow.definition["cron"]),
            args=[workflow.id],
            id=f"wf_{workflow.id}"
        )
    
    def cleanup_logs(self):
        """Keep the database lean by removing old logs."""
        db = SessionLocal()
        try:
            # Logic: Delete logs where ID is NOT in the top 1000
            # This is high-performance for SQLite
            db.execute("""
                DELETE FROM task_logs 
                WHERE id NOT IN (
                    SELECT id FROM task_logs 
                    ORDER BY execution_time DESC 
                    LIMIT 1000
                )
            """)
            db.commit()
            print("🧹 Log cleanup complete: Kept last 1000 entries.")
        finally:
            db.close()


scheduler_service = AutomationScheduler()