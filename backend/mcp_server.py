"""
MCP Server — Trading Research Tools

Exposes 5 tools over stdio transport using the MCP protocol.
Spawned as a subprocess by mcp_client.py on FastAPI startup.
Any MCP-compatible client (Claude Desktop, other agents) can connect to this server.
"""
import os
import sys

# Ensure backend/ is on the path when run as a subprocess
sys.path.insert(0, os.path.dirname(__file__))

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("trading-research-tools")


@mcp.tool()
async def get_live_price(metal: str, market: str) -> dict:
    """Fetch live price, 24h high/low, and % change for a metal on a given market."""
    from tools.price_feed import get_live_price as _fn
    return await _fn(metal, market)


@mcp.tool()
async def search_news(query: str, max_results: int = 5) -> list:
    """Search the web for latest financial news and headlines."""
    from tools.web_search import search_news as _fn
    return await _fn(query, max_results)


@mcp.tool()
async def get_technical_indicators(metal: str, market: str) -> dict:
    """Fetch historical price data and compute RSI, MACD, MA50, MA200, support, resistance."""
    from tools.filesystem import get_technical_indicators as _fn
    return await _fn(metal, market)


@mcp.tool()
async def convert_usd_to_inr(amount_usd: float) -> dict:
    """Convert a USD amount to INR at the current live exchange rate."""
    from tools.currency_converter import convert_usd_to_inr as _fn
    return await _fn(amount_usd)


@mcp.tool()
async def save_signal(signal: dict) -> dict:
    """Persist a completed trading signal to the filesystem as JSON."""
    from tools.filesystem import save_signal as _fn
    return await _fn(signal)


if __name__ == "__main__":
    mcp.run()
