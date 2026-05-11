import json
import math
import os
from datetime import datetime, timezone

from agents.react_runner import emit, get_client
from tools.filesystem import save_signal

_SUBMIT_TOOL = {
    "name": "submit_signal",
    "description": "Submit the final structured trading signal after reasoning over all agent inputs",
    "input_schema": {
        "type": "object",
        "properties": {
            "signal":               {"type": "string", "enum": ["BUY", "SELL", "HOLD"]},
            "confidence":           {"type": "number", "description": "0.0 to 1.0"},
            "rationale":            {"type": "string"},
            "price_summary":        {"type": "string"},
            "technical_summary":    {"type": "string"},
            "sentiment_summary":    {"type": "string"},
            "risk_flags":           {"type": "array", "items": {"type": "string"}},
        },
        "required": [
            "signal", "confidence", "rationale",
            "price_summary", "technical_summary", "sentiment_summary", "risk_flags",
        ],
    },
}


async def run(
    metal: str,
    market: str,
    price_data: dict,
    news_data: dict,
    technical_data: dict,
) -> dict:
    client = get_client()
    model = os.getenv("LLM_MODEL", "claude-sonnet-4-6")

    await emit("Signal Agent", "Reason", metal, "Synthesising price + sentiment + technical data")

    system = (
        f"You are a senior commodity analyst generating a trading signal for {metal} on {market}. "
        "You have structured outputs from three specialist agents. "
        "Reason holistically: identify converging signals, note conflicting evidence, flag risks. "
        "You MUST call submit_signal to deliver your output."
    )
    def _safe(v):
        if isinstance(v, float) and math.isnan(v):
            return None
        return v

    def _sanitize(obj):
        if isinstance(obj, dict):
            return {k: _sanitize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [_sanitize(i) for i in obj]
        return _safe(obj)

    user_msg = (
        f"Generate a {metal} trading signal for {market}.\n\n"
        f"PRICE DATA:\n{json.dumps(_sanitize(price_data), indent=2)}\n\n"
        f"NEWS & SENTIMENT:\n{json.dumps(_sanitize(news_data), indent=2)}\n\n"
        f"TECHNICAL ANALYSIS:\n{json.dumps(_sanitize(technical_data), indent=2)}"
    )

    response = await client.messages.create(
        model=model,
        max_tokens=1024,
        system=system,
        tools=[_SUBMIT_TOOL],
        tool_choice={"type": "any"},
        messages=[{"role": "user", "content": user_msg}],
    )

    signal_input = next(
        (b.input for b in response.content if b.type == "tool_use" and b.name == "submit_signal"),
        None,
    )
    if not signal_input:
        await emit("Signal Agent", "Error", metal, "submit_signal not called")
        return {"error": "signal_agent_failed"}

    signal = {
        "asset":              metal,
        "market":             market,
        "signal":             signal_input.get("signal", "HOLD"),
        "confidence":         signal_input.get("confidence", 0.0),
        "rationale":          signal_input.get("rationale", ""),
        "price_summary":      signal_input.get("price_summary", ""),
        "technical_summary":  signal_input.get("technical_summary", ""),
        "sentiment_summary":  signal_input.get("sentiment_summary", ""),
        "risk_flags":         signal_input.get("risk_flags", []),
        "price_data":         _sanitize(price_data),
        "technical_data":     _sanitize(technical_data),
        "news_data":          _sanitize(news_data),
        "generated_at":       datetime.now(timezone.utc).isoformat(),
    }

    await save_signal(signal)
    await emit(
        "Signal Agent", "Output", metal,
        f"{signal['signal']} {metal} {market} — confidence {signal['confidence']:.2f}",
    )
    return signal
