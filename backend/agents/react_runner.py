import json
import os
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable

import anthropic

from streaming.log_queue import broadcast

_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


async def emit(agent_name: str, step: str, metal: str, msg: str) -> None:
    await broadcast({
        "agent": agent_name,
        "step": step,
        "metal": metal,
        "msg": msg,
        "ts": datetime.now(timezone.utc).isoformat(),
    })


async def run_react(
    agent_name: str,
    metal: str,
    system: str,
    user_message: str,
    tools: list[dict],
    tool_map: dict[str, Callable[..., Awaitable[Any]]],
    max_iterations: int = 6,
) -> str:
    client = get_client()
    model = os.getenv("LLM_MODEL", "claude-sonnet-4-6")
    messages: list[dict] = [{"role": "user", "content": user_message}]

    await emit(agent_name, "Reason", metal, user_message[:120])

    for _ in range(max_iterations):
        response = await client.messages.create(
            model=model,
            max_tokens=2048,
            system=system,
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            text = next((b.text for b in response.content if hasattr(b, "text")), "")
            await emit(agent_name, "Output", metal, text[:140])
            return text

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []

            for block in response.content:
                if block.type == "tool_use":
                    await emit(agent_name, "Act", metal, f"{block.name}({json.dumps(block.input)[:80]})")
                    fn = tool_map.get(block.name)
                    result = await fn(**block.input) if fn else {"error": f"Unknown tool: {block.name}"}
                    await emit(agent_name, "Observe", metal, str(result)[:140])
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result),
                    })

            messages.append({"role": "user", "content": tool_results})

    await emit(agent_name, "Error", metal, "Max iterations reached")
    return '{"error": "max_iterations_reached"}'
