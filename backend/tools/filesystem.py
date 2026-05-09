import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
import yfinance as yf

from tools.price_feed import TICKERS

DATA_DIR = Path(__file__).parent.parent / "data" / "historical"
SIGNALS_DIR = Path(__file__).parent.parent / "outputs" / "signals"


# ── Technical indicator helpers ───────────────────────────────────────────────

def _rsi(closes: pd.Series, period: int = 14) -> float:
    delta = closes.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss
    return round(float((100 - 100 / (1 + rs)).iloc[-1]), 2)


def _macd(closes: pd.Series) -> dict[str, Any]:
    ema12 = closes.ewm(span=12, adjust=False).mean()
    ema26 = closes.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    histogram = macd_line - signal_line
    return {
        "macd": round(float(macd_line.iloc[-1]), 4),
        "signal": round(float(signal_line.iloc[-1]), 4),
        "histogram": round(float(histogram.iloc[-1]), 4),
        "crossover": "bullish" if macd_line.iloc[-1] > signal_line.iloc[-1] else "bearish",
    }


# ── Data fetching / caching ───────────────────────────────────────────────────

def _fetch_and_cache(metal: str, market: str) -> pd.DataFrame:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ticker_sym = TICKERS.get(metal, {}).get(market)
    if not ticker_sym:
        return pd.DataFrame()
    df = yf.Ticker(ticker_sym).history(period="1y")
    if not df.empty:
        df.index.name = "Date"
        df.to_csv(DATA_DIR / f"{metal}_{market}.csv")
    return df


def _compute_indicators_sync(metal: str, market: str) -> dict[str, Any]:
    path = DATA_DIR / f"{metal}_{market}.csv"
    if path.exists():
        df = pd.read_csv(path, parse_dates=["Date"], index_col="Date")
    else:
        df = _fetch_and_cache(metal, market)

    if df.empty or len(df) < 30:
        return {"error": f"Insufficient historical data for {metal}/{market}"}

    closes = df["Close"].dropna()
    ma50 = closes.rolling(50).mean()
    ma200 = closes.rolling(200).mean() if len(closes) >= 200 else None
    current = float(closes.iloc[-1])

    return {
        "metal": metal,
        "market": market,
        "current_price": round(current, 2),
        "rsi": _rsi(closes),
        "macd": _macd(closes),
        "ma50": round(float(ma50.iloc[-1]), 2),
        "ma200": round(float(ma200.iloc[-1]), 2) if ma200 is not None else None,
        "above_ma50": current > float(ma50.iloc[-1]),
        "above_ma200": (current > float(ma200.iloc[-1])) if ma200 is not None else None,
        "support": round(float(closes.tail(50).min()), 2),
        "resistance": round(float(closes.tail(50).max()), 2),
        "trend": "uptrend" if float(ma50.iloc[-1]) > float(ma50.iloc[-20]) else "downtrend",
        "data_points": len(closes),
    }


async def get_technical_indicators(metal: str, market: str) -> dict[str, Any]:
    try:
        return await asyncio.to_thread(_compute_indicators_sync, metal.upper(), market.upper())
    except Exception as e:
        return {"error": str(e)}


# ── Signal persistence ────────────────────────────────────────────────────────

def _save_sync(signal: dict) -> dict:
    SIGNALS_DIR.mkdir(parents=True, exist_ok=True)
    ts = signal.get("generated_at", datetime.now(timezone.utc).isoformat())[:10]
    path = SIGNALS_DIR / f"{signal.get('asset', 'UNKNOWN')}_{signal.get('market', 'UNKNOWN')}_{ts}.json"
    with open(path, "w") as f:
        json.dump(signal, f, indent=2)
    return {"saved_to": str(path)}


async def save_signal(signal: dict) -> dict:
    return await asyncio.to_thread(_save_sync, signal)
