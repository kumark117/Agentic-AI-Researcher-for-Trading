import asyncio
import os

import httpx


def _fetch_rate_sync() -> float:
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    resp = httpx.get(
        "https://www.alphavantage.co/query",
        params={
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": "USD",
            "to_currency": "INR",
            "apikey": api_key,
        },
        timeout=15,
    )
    resp.raise_for_status()
    rate_info = resp.json().get("Realtime Currency Exchange Rate", {})
    rate_str = rate_info.get("5. Exchange Rate", "")
    return round(float(rate_str), 4) if rate_str else 84.0


async def get_exchange_rate() -> dict:
    try:
        rate = await asyncio.to_thread(_fetch_rate_sync)
    except Exception:
        rate = 84.0
    return {"pair": "USD/INR", "rate": rate}


async def convert_usd_to_inr(amount_usd: float) -> dict:
    rate_data = await get_exchange_rate()
    rate = rate_data["rate"]
    return {
        "amount_usd": round(amount_usd, 2),
        "amount_inr": round(amount_usd * rate, 2),
        "rate": rate,
    }
