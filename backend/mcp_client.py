"""
MCP Client — manages the trading-research-tools MCP server subprocess.

On FastAPI startup  → start_mcp_server() spawns mcp_server.py over stdio
                       and initialises a persistent ClientSession.
During a request    → call_tool(name, args) dispatches tool calls through
                       the MCP protocol instead of direct Python imports.
On FastAPI shutdown → stop_mcp_server() tears everything down cleanly.

This is the canonical MCP client pattern: one long-lived session per process,
shared across all concurrent agent calls.
"""
import json
import os
import sys
from contextlib import AsyncExitStack

from mcp import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client

_session: ClientSession | None = None
_exit_stack: AsyncExitStack | None = None


async def start_mcp_server() -> None:
    global _session, _exit_stack

    server_params = StdioServerParameters(
        command=sys.executable,                          # same Python interpreter
        args=[os.path.join(os.path.dirname(__file__), "mcp_server.py")],
        env={**os.environ},                              # inherit all env vars (API keys etc.)
    )

    _exit_stack = AsyncExitStack()
    read, write = await _exit_stack.enter_async_context(stdio_client(server_params))
    _session = await _exit_stack.enter_async_context(ClientSession(read, write))
    await _session.initialize()


async def stop_mcp_server() -> None:
    global _session, _exit_stack
    if _exit_stack:
        await _exit_stack.aclose()
    _session = None
    _exit_stack = None


async def call_tool(name: str, args: dict):
    """Call a tool on the MCP server and return the parsed result."""
    if not _session:
        raise RuntimeError("MCP server is not running — call start_mcp_server() first")

    result = await _session.call_tool(name, args)

    # MCP returns a list of content blocks; we expect the first to be text (JSON).
    if result.content:
        first = result.content[0]
        if hasattr(first, "text"):
            try:
                return json.loads(first.text)
            except (json.JSONDecodeError, TypeError):
                return first.text

    return {}
