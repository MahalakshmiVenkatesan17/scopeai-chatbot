import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

# Setup a dedicated logger for Stripe webhooks
stripe_logger = logging.getLogger("stripe_webhooks")
stripe_logger.setLevel(logging.INFO)

# Ensure logs directory exists
LOGS_DIR = Path("app/logs")
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# File handler for JSONL format
log_file = LOGS_DIR / "stripe_webhooks.jsonl"
file_handler = logging.FileHandler(log_file)
file_handler.setLevel(logging.INFO)

class JsonFormatter(logging.Formatter):
    def format(self, record):
        if hasattr(record, "webhook_data"):
            return json.dumps(record.webhook_data)
        return json.dumps({"message": record.getMessage(), "timestamp": datetime.now(timezone.utc).isoformat()})

file_handler.setFormatter(JsonFormatter())
stripe_logger.addHandler(file_handler)
# Prevent propagating to root logger to avoid double logging in standard output
stripe_logger.propagate = False

def log_stripe_webhook_event(event_id: str, event_type: str, payload: dict, response: dict, status: str = "processed"):
    """
    Log a Stripe webhook event to a JSONL file for audit trailing.
    This serves as a file-based alternative to a database table.
    """
    log_data = {
        "id": event_id,
        "type": event_type,
        "status": status,
        "payload": payload,
        "response": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    # Pass data via the extra kwarg so the custom formatter can pick it up
    stripe_logger.info("Stripe Webhook Event", extra={"webhook_data": log_data})
