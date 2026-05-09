import json

from agents.react_runner import run_react
from tools.filesystem import get_technical_indicators

_TOOLS = [
    {
        "name": "get_technical_indicators",
        "description": (
            "Fetch historical price data and calculate RSI, MACD, "
            "MA50, MA200, support, and resistance for a metal/market pair"
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "metal":  {"type": "string", "enum": ["GOLD", "SILVER", "COPPER", "URANIUM", "ZINC"]},
                "market": {"type": "string", "enum": ["COMEX", "MCX", "LME"]},
            },
            "required": ["metal", "market"],
        },
    }
]

_TOOL_MAP = {"get_technical_indicators": get_technical_indicators}


async def run(metal: str, market: str) -> dict:
    system = (
        f"You are a technical analysis agent for {metal} on {market}. "
        "Use get_technical_indicators to fetch pre-calculated indicators. "
        "Reason about: RSI (oversold < 30, overbought > 70), MACD crossover direction, "
        "price vs MA50/MA200 (golden/death cross context), trend, support/resistance. "
        "Respond with ONLY a JSON object — no extra text:\n"
        '{"rsi": <float>, "rsi_signal": "<oversold|neutral|overbought>", '
        '"macd_crossover": "<bullish|bearish>", "trend": "<uptrend|downtrend>", '
        '"above_ma50": <bool>, "above_ma200": <bool|null>, '
        '"support": <float>, "resistance": <float>, '
        '"bias": "<bullish|bearish|neutral>", "key_observation": "<one sentence>"}'
    )
    user_msg = f"Perform technical analysis on {metal} ({market}) using historical price data."

    raw = await run_react("Technical Agent", metal, system, user_msg, _TOOLS, _TOOL_MAP)
    try:
        start, end = raw.find("{"), raw.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        pass
    return {"raw": raw, "error": "parse_failed"}
