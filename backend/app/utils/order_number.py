"""
Human-friendly, unique order number generator, e.g. ORD-20260724-9F3K2.
"""
import secrets
from datetime import datetime, timezone


def generate_order_number() -> str:
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_part = secrets.token_hex(3).upper()
    return f"ORD-{date_part}-{random_part}"
