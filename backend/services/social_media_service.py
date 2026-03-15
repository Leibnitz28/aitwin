"""
Social Media Ingestion Service
Fetches public data from Twitter/X, Reddit, and GitHub for a user handle.
Stores all content in ChromaDB so the AI twin can respond with real data.
"""

from typing import Optional
import json

try:
    import requests
    has_requests = True
except ImportError:
    has_requests = False


class SocialMediaService:
    """Ingest public social media posts and profiles into ChromaDB."""

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (compatible; EchoSoulBot/1.0; "
            "+https://echosoul.ai/bot)"
        ),
        "Accept": "application/json",
    }

    # ── GitHub ──────────────────────────────────────────────────────────────────
    @classmethod
    async def ingest_github(cls, handle: str, user_id: str) -> dict:
        """Fetch GitHub profile, bio, and top repo READMEs."""
        if not has_requests:
            return {"error": "requests not installed."}

        texts = []

        # Profile
        try:
            r = requests.get(
                f"https://api.github.com/users/{handle}",
                headers=cls.HEADERS, timeout=10
            )
            r.raise_for_status()
            profile = r.json()
            bio_text = (
                f"GitHub Profile of {profile.get('name', handle)}:\n"
                f"Bio: {profile.get('bio', 'No bio')}\n"
                f"Location: {profile.get('location', 'Unknown')}\n"
                f"Company: {profile.get('company', 'N/A')}\n"
                f"Public repos: {profile.get('public_repos', 0)}\n"
                f"Followers: {profile.get('followers', 0)}, Following: {profile.get('following', 0)}\n"
            )
            texts.append(bio_text)
        except Exception as e:
            print(f"⚠️ GitHub profile fetch error: {e}")
            return {"error": f"Could not fetch GitHub profile for @{handle}: {str(e)}"}

        # Top repos
        try:
            r2 = requests.get(
                f"https://api.github.com/users/{handle}/repos?sort=stars&per_page=10",
                headers=cls.HEADERS, timeout=10
            )
            if r2.ok:
                repos = r2.json()
                for repo in repos[:8]:
                    repo_text = (
                        f"Repository: {repo.get('name')}\n"
                        f"Description: {repo.get('description', 'No description')}\n"
                        f"Language: {repo.get('language', 'Unknown')}\n"
                        f"Stars: {repo.get('stargazers_count', 0)}\n"
                    )
                    texts.append(repo_text)
        except Exception as e:
            print(f"⚠️ GitHub repos fetch error: {e}")

        stored = cls._store_texts(user_id=user_id, platform="github", handle=handle, texts=texts)

        return {
            "platform": "github",
            "handle": handle,
            "posts_ingested": len(texts),
            "chunks_stored": stored,
        }

    # ── Reddit ──────────────────────────────────────────────────────────────────
    @classmethod
    async def ingest_reddit(cls, handle: str, user_id: str) -> dict:
        """Fetch Reddit user's public posts and comments."""
        if not has_requests:
            return {"error": "requests not installed."}

        texts = []
        headers = {**cls.HEADERS, "Accept": "application/json"}

        try:
            r = requests.get(
                f"https://www.reddit.com/user/{handle}/submitted.json?limit=50",
                headers=headers, timeout=15
            )
            r.raise_for_status()
            data = r.json()
            posts = data.get("data", {}).get("children", [])

            for post in posts[:30]:
                p = post.get("data", {})
                text = (
                    f"Reddit post by u/{handle}:\n"
                    f"Subreddit: r/{p.get('subreddit', '')}\n"
                    f"Title: {p.get('title', '')}\n"
                    f"Content: {p.get('selftext', '')[:500]}\n"
                    f"Score: {p.get('score', 0)}\n"
                )
                if len(text.strip()) > 30:
                    texts.append(text)
        except Exception as e:
            print(f"⚠️ Reddit posts fetch error: {e}")

        # Comments
        try:
            r2 = requests.get(
                f"https://www.reddit.com/user/{handle}/comments.json?limit=50",
                headers=headers, timeout=15
            )
            if r2.ok:
                data2 = r2.json()
                comments = data2.get("data", {}).get("children", [])
                for comment in comments[:20]:
                    c = comment.get("data", {})
                    body = c.get("body", "").strip()
                    if body and len(body) > 20:
                        texts.append(
                            f"Reddit comment by u/{handle} in r/{c.get('subreddit', '')}:\n{body[:400]}"
                        )
        except Exception as e:
            print(f"⚠️ Reddit comments fetch error: {e}")

        if not texts:
            return {"error": f"No public posts found for u/{handle}"}

        stored = cls._store_texts(user_id=user_id, platform="reddit", handle=handle, texts=texts)

        return {
            "platform": "reddit",
            "handle": handle,
            "posts_ingested": len(texts),
            "chunks_stored": stored,
        }

    # ── Twitter / X (public scrape) ─────────────────────────────────────────────
    @classmethod
    async def ingest_twitter(cls, handle: str, user_id: str) -> dict:
        """
        Fetch public tweets using ntscraper (no API key needed).
        Falls back to a graceful message if ntscraper isn't installed.
        """
        try:
            from ntscraper import Nitter  # type: ignore
            scraper = Nitter(log_level=0)
            tweets_data = scraper.get_tweets(handle, mode="user", number=50)
            tweets = tweets_data.get("tweets", [])

            texts = []
            for tweet in tweets[:40]:
                text = tweet.get("text", "").strip()
                if text and len(text) > 10:
                    texts.append(f"Tweet by @{handle}: {text}")

            if not texts:
                return {"error": f"No public tweets found for @{handle}"}

            stored = cls._store_texts(user_id=user_id, platform="twitter", handle=handle, texts=texts)

            return {
                "platform": "twitter",
                "handle": handle,
                "posts_ingested": len(texts),
                "chunks_stored": stored,
            }

        except ImportError:
            # Graceful degradation — ntscraper not installed
            return {
                "platform": "twitter",
                "handle": handle,
                "posts_ingested": 0,
                "chunks_stored": 0,
                "warning": (
                    "ntscraper is not installed. "
                    "Install it with: pip install ntscraper"
                ),
            }
        except Exception as e:
            return {"error": f"Twitter scrape failed for @{handle}: {str(e)}"}

    # ── Storage helper ───────────────────────────────────────────────────────────
    @classmethod
    def _store_texts(cls, user_id: str, platform: str, handle: str, texts: list[str]) -> int:
        """Store a list of text snippets into ChromaDB."""
        stored = 0
        try:
            from services.vectordb_service import VectorDBService  # type: ignore
            if VectorDBService.is_ready():
                for i, text in enumerate(texts):
                    VectorDBService.add_social_content(
                        user_id=user_id,
                        platform=platform,
                        handle=handle,
                        text=text,
                        chunk_index=i,
                    )
                    stored += 1
        except Exception as e:
            print(f"⚠️ ChromaDB store error ({platform}): {e}")
        return stored
