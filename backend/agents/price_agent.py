import json

from agents.react_runner import run_react

_TOOLS = [
    {
        "name": "get_live_price",
        "description": "Fetch live price, 24h high/low, and % change for a metal on a given market",
        "input_schema": {
            "type": "object",
            "properties": {
                "metal":  {"type": "string", "enum": ["GOLD", "SILVER", "COPPER", "URANIUM", "ZINC"]},
                "market": {"type": "string", "enum": ["COMEX", "MCX", "LME"]},
            },
            "required": ["metal", "market"],
        },
    },
    {
        "name": "convert_usd_to_inr",
        "description": "Convert a USD amount to INR at the current live exchange rate",
        "input_schema": {
            "type": "object",
            "properties": {
                "amount_usd": {"type": "number"},
            },
            "required": ["amount_usd"],
        },
    },
]

async def run(metal: str, market: str) -> dict:
    system = (
        f"You are a live price data agent for commodity markets. "
        f"Fetch the current price of {metal} on {market}. "
        "Always also convert the USD price to INR. "
        "When you have both values, respond with ONLY a JSON object — no extra text:\n"
        '{"price": <float>, "change_pct": <float>, "high_24h": <float>, '
        '"low_24h": <float>, "currency": "USD", "price_inr": <float>}'
    )
    user_msg = f"Get current price data for {metal} on {market}. Include INR equivalent."

    raw = await run_react("Price Agent", metal, system, user_msg, _TOOLS)
    try:
        start, end = raw.find("{"), raw.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        pass
    return {"raw": raw, "error": "parse_failed"}
