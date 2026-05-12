import json

from agents.react_runner import run_react

_TOOLS = [
    {
        "name": "search_news",
        "description": "Search the web for latest financial news and headlines",
        "input_schema": {
            "type": "object",
            "properties": {
                "query":       {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "default": 5},
            },
            "required": ["query"],
        },
    }
]

async def run(metal: str) -> dict:
    system = (
        f"You are a financial news and sentiment agent specialising in {metal} markets. "
        "Run multiple targeted searches to cover: (1) recent price news, "
        "(2) supply/demand drivers, (3) macro factors like Fed policy, inflation, geopolitics. "
        "After gathering enough headlines, respond with ONLY a JSON object — no extra text:\n"
        '{"sentiment_score": <float -1.0 to 1.0>, "bias": "<bullish|bearish|neutral>", '
        '"key_headlines": [<string>, <string>, <string>], "summary": "<one concise sentence>"}'
    )
    user_msg = (
        f"Research current news and sentiment for {metal}. "
        "Use multiple search queries to get a well-rounded picture."
    )

    raw = await run_react("News Agent", metal, system, user_msg, _TOOLS, max_iterations=5)
    try:
        start, end = raw.find("{"), raw.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        pass
    return {"raw": raw, "error": "parse_failed"}
