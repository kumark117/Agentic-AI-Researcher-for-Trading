import asyncio
import os
from typing import Any

import httpx

AV_BASE = "https://www.alphavantage.co/query"

# Alpha Vantage config per metal.
# "commodity" uses AV's physical commodity function → actual spot price.
# "stock"     uses GLOBAL_QUOTE on an ETF proxy (no direct commodity function).
AV_CONFIG: dict[str, dict] = {
    "GOLD":    {"type": "commodity", "function": "GOLD"},
    "SILVER":  {"type": "commodity", "function": "SILVER"},
    "COPPER":  {"type": "commodity", "function": "COPPER"},
    "URANIUM": {"type": "stock",     "symbol": "URA"},
    "ZINC":    {"type": "stock",     "symbol": "DBB"},
}


def _api_key() -> str:
    key = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    if not key:
        raise ValueError("ALPHA_VANTAGE_API_KEY env var not set")
    return key


def _check_rate_limit(data: dict) -> None:
    if "Note" in data or "Information" in data:
        msg = data.get("Note") or data.get("Information", "")
        raise RuntimeError(f"Alpha Vantage rate limit reached: {msg[:120]}")


def _fetch_commodity_live_sync(function: str) -> dict[str, Any]:
    resp = httpx.get(
        AV_BASE,
        params={"function": function, "interval": "daily", "apikey": _api_key()},
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    _check_rate_limit(data)
    rows = data.get("data", [])
    if not rows:
        return {"error": f"No commodity data returned for {function}"}
    latest = rows[0]
    prev = rows[1] if len(rows) > 1 else rows[0]
    price = float(latest["value"])
    prev_price = float(prev["value"])
    change_pct = ((price - prev_price) / prev_price * 100) if prev_price else 0.0
    return {
        "price": round(price, 2),
        "change_pct": round(change_pct, 3),
        "high_24h": round(price, 2),
        "low_24h": round(price, 2),
        "volume": None,
        "date": latest["date"],
    }


def _fetch_stock_quote_sync(symbol: str) -> dict[str, Any]:
    resp = httpx.get(
        AV_BASE,
        params={"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": _api_key()},
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json()
    _check_rate_limit(data)
    quote = data.get("Global Quote", {})
    if not quote or not quote.get("05. price"):
        return {"error": f"No quote data for {symbol}"}
    price = float(quote["05. price"])
    prev = float(quote["08. previous close"])
    change_pct = ((price - prev) / prev * 100) if prev else 0.0
    return {
        "price": round(price, 2),
        "change_pct": round(change_pct, 3),
        "high_24h": round(float(quote["03. high"]), 2),
        "low_24h": round(float(quote["04. low"]), 2),
        "volume": int(quote["06. volume"]),
        "date": quote["07. latest trading day"],
    }


async def get_live_price(metal: str, market: str) -> dict[str, Any]:
    metal = metal.upper()
    config = AV_CONFIG.get(metal)
    if not config:
        return {"error": f"No Alpha Vantage config for {metal}"}
    try:
        if config["type"] == "commodity":
            result = await asyncio.to_thread(_fetch_commodity_live_sync, config["function"])
        else:
            result = await asyncio.to_thread(_fetch_stock_quote_sync, config["symbol"])
        result.update({"ticker": config.get("function", config.get("symbol")), "market": market})
        return result
    except Exception as e:
        return {"error": str(e)}
