import asyncio
from typing import Any

import yfinance as yf

# Primary tickers per metal per market.
# MCX direct data is not available via yfinance; COMEX/LME prices are used as
# the baseline and converted to INR by the currency_converter tool.
TICKERS: dict[str, dict[str, str | None]] = {
    "GOLD":    {"COMEX": "GC=F",  "MCX": "GC=F"},
    "SILVER":  {"COMEX": "SI=F",  "MCX": "SI=F"},
    "COPPER":  {"COMEX": "HG=F",  "MCX": "HG=F"},
    "URANIUM": {"COMEX": "URA",   "MCX": None},
    "ZINC":    {"COMEX": "ZNC=F", "MCX": "ZNC=F"},
}


def _fetch_sync(ticker_symbol: str) -> dict[str, Any]:
    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period="2d")
    if hist.empty:
        return {"error": f"No data returned for ticker {ticker_symbol}"}
    latest = hist.iloc[-1]
    prev = hist.iloc[-2] if len(hist) > 1 else latest
    price = float(latest["Close"])
    prev_close = float(prev["Close"])
    change_pct = ((price - prev_close) / prev_close) * 100 if prev_close else 0.0
    return {
        "price": round(price, 2),
        "change_pct": round(change_pct, 3),
        "high_24h": round(float(latest["High"]), 2),
        "low_24h": round(float(latest["Low"]), 2),
        "volume": int(latest["Volume"]),
        "ticker": ticker_symbol,
    }


async def get_live_price(metal: str, market: str) -> dict[str, Any]:
    metal, market = metal.upper(), market.upper()
    ticker_symbol = TICKERS.get(metal, {}).get(market)
    if not ticker_symbol:
        return {"error": f"No ticker configured for {metal} on {market}"}
    try:
        return await asyncio.to_thread(_fetch_sync, ticker_symbol)
    except Exception as e:
        return {"error": str(e)}
