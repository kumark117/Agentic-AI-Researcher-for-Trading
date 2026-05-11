import asyncio
import os
from typing import Any


def _search_sync(query: str, max_results: int) -> list[dict[str, str]]:
    from tavily import TavilyClient
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY", ""))
    response = client.search(query, max_results=max_results)
    return [
        {
            "title": r.get("title", ""),
            "snippet": r.get("content", ""),
            "url": r.get("url", ""),
        }
        for r in response.get("results", [])
    ]


async def search_news(query: str, max_results: int = 5) -> list[dict[str, Any]]:
    try:
        return await asyncio.to_thread(_search_sync, query, max_results)
    except Exception as e:
        return [{"title": "Search unavailable", "snippet": str(e), "url": ""}]
