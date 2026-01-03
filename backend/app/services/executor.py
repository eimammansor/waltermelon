import time
import logging
from typing import Any, Dict
from functools import wraps

class ActionHandlers:
    @staticmethod
    def email(params: Dict[str, Any]):
        # Placeholder for your SMTP logic
        print(f"📧 Sending Email to: {params.get('to')} | Subject: {params.get('subject')}")
        return True

    @staticmethod
    def whatsapp(params: Dict[str, Any]):
        # Placeholder for your Twilio or Meta API logic
        print(f"💬 Sending WhatsApp to: {params.get('phone')} | Body: {params.get('body')}")
        return True

    @staticmethod
    def delay(params: Dict[str, Any]):
        seconds = params.get("seconds", 5)
        print(f"⏳ Delaying for {seconds} seconds...")
        time.sleep(seconds)
        return True

def run_workflow_logic(steps: list):
    """The Parser: Loops through JSON steps and executes them"""
    for step in steps:
        action_type = step.get("type")
        params = step.get("params", {})
        
        # 2. Conditional Logic implementation
        if action_type == "condition":
            condition_met = eval_condition(params) # A helper to check logic
            if not condition_met:
                print("🚫 Condition not met, stopping flow.")
                break
            continue

        # 3. Dynamic Action Calling
        handler = getattr(ActionHandlers, action_type, None)
        if handler:
            try:
                # 4. Error Handling & Retries
                execute_with_retry(handler, params)
            except Exception as e:
                logging.error(f"❌ Action {action_type} failed: {e}")
                break 

def execute_with_retry(func, params, retries=3):
    """Simple Retry Logic for Pi 5 stability"""
    for i in range(retries):
        try:
            return func(params)
        except Exception as e:
            if i == retries - 1: raise e
            time.sleep(2 ** i) # Exponential backoff

def retry_action(retries: int = 3, delay: int = 2):
    """Decorator to retry actions with exponential backoff."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            m_delay = delay
            for i in range(retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if i == retries - 1: # Last attempt
                        logging.error(f"❌ Final attempt failed for {func.__name__}: {e}")
                        raise e
                    logging.warning(f"⚠️ {func.__name__} failed. Retrying in {m_delay}s... (Attempt {i+1}/{retries})")
                    time.sleep(m_delay)
                    m_delay *= 2 # Exponentially increase wait time
            return None
        return wrapper
    return decorator