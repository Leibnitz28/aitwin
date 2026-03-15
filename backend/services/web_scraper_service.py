"""
Web Scraper Service
Fetches and parses public web pages, stores cleaned text into ChromaDB
so the AI twin can answer questions based on scraped content about a person.
"""

import re
from typing import Optional
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup  # type: ignore
    has_scraper = True
except ImportError:
    has_scraper = False


class WebScraperService:
    """Scrape public web pages and store content in ChromaDB vector memory."""

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
    }

    @classmethod
    async def ingest_url(cls, url: str, user_id: str) -> dict:
        """
        Scrape a URL, clean the text, and store it in ChromaDB.
        Returns status dict with page title, word count, and storage result.
        """
        if not has_scraper:
            return {"error": "beautifulsoup4 / requests not installed."}

        try:
            response = requests.get(url, headers=cls.HEADERS, timeout=20)
            response.raise_for_status()
        except Exception as e:
            return {"error": f"Failed to fetch URL: {str(e)}"}

        soup = BeautifulSoup(response.content, "html.parser")

        # Extract title
        title = soup.find("title")
        page_title = title.get_text(strip=True) if title else url

        # Remove script / style / nav / footer noise
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "noscript"]):
            tag.decompose()

        # Prefer main content areas
        main = soup.find("main") or soup.find("article") or soup.find(id="content") or soup.find("body")
        text = main.get_text(separator="\n", strip=True) if main else soup.get_text(separator="\n", strip=True)

        # Clean whitespace
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]{2,}", " ", text)
        text = text.strip()

        if len(text) < 50:
            return {"error": "Page returned insufficient text content."}

        # Split into ~500-word chunks for better embedding
        chunks = cls._chunk_text(text, chunk_size=500)
        stored_chunks = 0

        try:
            from services.vectordb_service import VectorDBService  # type: ignore
            if VectorDBService.is_ready():
                for i, chunk in enumerate(chunks):
                    VectorDBService.add_web_content(
                        user_id=user_id,
                        url=url,
                        title=page_title,
                        text=chunk,
                        chunk_index=i,
                    )
                stored_chunks = len(chunks)
        except Exception as e:
            print(f"⚠️ ChromaDB storage error: {e}")

        return {
            "title": page_title,
            "url": url,
            "word_count": len(text.split()),
            "chunks_stored": stored_chunks,
            "preview": text[:300] + ("..." if len(text) > 300 else ""),
        }

    @classmethod
    def _chunk_text(cls, text: str, chunk_size: int = 500) -> list[str]:
        """Split text into overlapping chunks by word count."""
        words = text.split()
        chunks = []
        overlap = 50  # words overlap between chunks
        i = 0
        while i < len(words):
            chunk_words = words[i: i + chunk_size]
            chunks.append(" ".join(chunk_words))
            i += chunk_size - overlap
        return [c for c in chunks if len(c.split()) > 20]
