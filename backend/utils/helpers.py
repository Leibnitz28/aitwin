import uuid
from datetime import datetime


def generate_id() -> str:
    """Generate a short unique ID."""
    return str(uuid.uuid4())


def generate_short_id() -> str:
    """Generate a short 8-char hex ID."""
    return uuid.uuid4().hex[:8]


def format_date(dt: datetime) -> str:
    """Format a datetime to a readable string."""
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def sanitize_text(text: str) -> str:
    """Strip whitespace and remove null bytes."""
    return text.strip().replace("\x00", "")


def word_count(text: str) -> int:
    """Return the number of words in a text string."""
    return len(text.split())


def truncate(text: str, length: int = 120) -> str:
    """Truncate text with ellipsis."""
    return text[:length] + ("..." if len(text) > length else "")
