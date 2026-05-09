import asyncio

import yfinance as yf


def _fetch_rate_sync() -> float:
    ticker = yf.Ticker("USDINR=X")
    hist = ticker.history(period="1d")
    if hist.empty:
        return 84.0
    return round(float(hist.iloc[-1]["Close"]), 4)


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
