import asyncio
from typing import Any


def _search_sync(query: str, max_results: int) -> list[dict[str, str]]:
    from duckduckgo_search import DDGS
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):
            results.append({
                "title": r.get("title", ""),
                "snippet": r.get("body", ""),
                "url": r.get("href", ""),
            })
    return results


async def search_news(query: str, max_results: int = 5) -> list[dict[str, Any]]:
    try:
        return await asyncio.to_thread(_search_sync, query, max_results)
    except Exception as e:
        return [{"title": "Search unavailable", "snippet": str(e), "url": ""}]
