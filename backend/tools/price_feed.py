import asyncio
import os
from typing import Any

import httpx

AV_BASE = "https://www.alphavantage.co/query"

# ETF/commodity proxies via Alpha Vantage (cloud-friendly, no IP blocking).
# "stock"     → GLOBAL_QUOTE (returns high/low/volume)
# "commodity" → AV commodity function (daily series, close only)
AV_CONFIG: dict[str, dict] = {
    "GOLD":    {"type": "stock",     "symbol": "GLD"},
    "SILVER":  {"type": "stock",     "symbol": "SLV"},
    "COPPER":  {"type": "commodity", "function": "COPPER"},
    "URANIUM": {"type": "stock",     "symbol": "URA"},
    "ZINC":    {"type": "stock",     "symbol": "DBB"},
}


def _api_key() -> str:
    key = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    if not key:
        raise ValueError("ALPHA_VANTAGE_API_KEY env var not set")
    return key


def _fetch_stock_quote_sync(symbol: str) -> dict[str, Any]:
    resp = httpx.get(
        AV_BASE,
        params={"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": _api_key()},
        timeout=20,
    )
    resp.raise_for_status()
    quote = resp.json().get("Global Quote", {})
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


def _fetch_commodity_live_sync(function: str) -> dict[str, Any]:
    resp = httpx.get(
        AV_BASE,
        params={"function": function, "interval": "daily", "apikey": _api_key()},
        timeout=20,
    )
    resp.raise_for_status()
    data = resp.json().get("data", [])
    if not data:
        return {"error": f"No commodity data for {function}"}
    latest = data[0]
    prev = data[1] if len(data) > 1 else data[0]
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


async def get_live_price(metal: str, market: str) -> dict[str, Any]:
    metal = metal.upper()
    config = AV_CONFIG.get(metal)
    if not config:
        return {"error": f"No Alpha Vantage config for {metal}"}
    try:
        if config["type"] == "stock":
            result = await asyncio.to_thread(_fetch_stock_quote_sync, config["symbol"])
        else:
            result = await asyncio.to_thread(_fetch_commodity_live_sync, config["function"])
        result.update({"ticker": config.get("symbol", config.get("function")), "market": market})
        return result
    except Exception as e:
        return {"error": str(e)}
