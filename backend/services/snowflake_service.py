"""
Snowflake Analytics Service
Handles conversation logging and analytics queries.
Falls back to mock data when Snowflake credentials are not configured.
"""

import random
from datetime import datetime
from config import Config


class SnowflakeService:
    """Interface to Snowflake for analytics storage and retrieval."""

    _connection = None

    @classmethod
    def _connect(cls):
        """Lazy-initialize Snowflake connection."""
        if cls._connection is not None:
            return True
        if not Config.has_snowflake():
            return False

        try:
            import snowflake.connector
            cls._connection = snowflake.connector.connect(
                account=Config.SNOWFLAKE_ACCOUNT,
                user=Config.SNOWFLAKE_USER,
                password=Config.SNOWFLAKE_PASSWORD,
                database=Config.SNOWFLAKE_DATABASE,
                schema=Config.SNOWFLAKE_SCHEMA,
                warehouse=Config.SNOWFLAKE_WAREHOUSE,
            )
            print("✅ Connected to Snowflake")
            return True
        except Exception as e:
            print(f"⚠️ Snowflake connection error: {e}")
            cls._connection = None
            return False

    @classmethod
    async def log_conversation(
        cls,
        twin_id: str,
        user_message: str,
        ai_reply: str,
        audio_url: str = None,
        timestamp: datetime = None,
    ):
        """Log a conversation exchange to Snowflake."""
        ts = timestamp or datetime.utcnow()

        if cls._connect() and cls._connection:
            try:
                cursor = cls._connection.cursor()
                cursor.execute(
                    """
                    INSERT INTO conversations (twin_id, user_message, ai_reply, audio_url, timestamp)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (twin_id, user_message, ai_reply, audio_url or "", ts.isoformat()),
                )
                cursor.close()
                return True
            except Exception as e:
                print(f"⚠️ Snowflake log error: {e}")

        # Mock: just print
        print(f"📝 [Mock Snowflake] Logged conversation for twin {twin_id[:8]}...")
        return False

    @classmethod
    async def get_analytics(cls) -> dict:
        """
        Query Snowflake for dashboard analytics.
        Returns mock data if Snowflake is unavailable.
        """
        if cls._connect() and cls._connection:
            try:
                cursor = cls._connection.cursor()

                # Total conversations
                cursor.execute("SELECT COUNT(*) FROM conversations")
                total = cursor.fetchone()[0]

                # This week's daily breakdown
                cursor.execute("""
                    SELECT DAYNAME(timestamp) as day, COUNT(*) as cnt
                    FROM conversations
                    WHERE timestamp >= DATEADD(day, -7, CURRENT_TIMESTAMP())
                    GROUP BY day ORDER BY MIN(timestamp)
                """)
                daily = [{"name": row[0][:3], "conversations": row[1]} for row in cursor.fetchall()]

                cursor.close()
                return {
                    "total_conversations": total,
                    "conversation_data": daily,
                }
            except Exception as e:
                print(f"⚠️ Snowflake analytics error: {e}")

        # Mock analytics data matching frontend charts
        return {
            "total_conversations": 1247,
            "active_users": 89,
            "accuracy_score": 94.2,
            "avg_response_time": 1.3,
            "conversation_data": [
                {"name": "Mon", "conversations": 12},
                {"name": "Tue", "conversations": 19},
                {"name": "Wed", "conversations": 15},
                {"name": "Thu", "conversations": 28},
                {"name": "Fri", "conversations": 22},
                {"name": "Sat", "conversations": 35},
                {"name": "Sun", "conversations": 30},
            ],
            "accuracy_data": [
                {"name": "Week 1", "accuracy": 78},
                {"name": "Week 2", "accuracy": 82},
                {"name": "Week 3", "accuracy": 87},
                {"name": "Week 4", "accuracy": 91},
                {"name": "Week 5", "accuracy": 93},
                {"name": "Week 6", "accuracy": 94},
            ],
            "personality_profile": {
                "Openness": 87,
                "Conscientiousness": 72,
                "Extraversion": 65,
                "Agreeableness": 81,
                "Neuroticism": 38,
            },
            "usage_stats": [
                {"label": "Text Conversations", "value": 892, "max": 1000},
                {"label": "Voice Conversations", "value": 355, "max": 1000},
                {"label": "Writing Samples Processed", "value": 47, "max": 50},
                {"label": "Voice Samples Used", "value": 12, "max": 20},
                {"label": "Blockchain Transactions", "value": 3, "max": 10},
                {"label": "Agent Invocations", "value": 4280, "max": 5000},
            ],
        }
