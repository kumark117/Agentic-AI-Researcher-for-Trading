import asyncio

from agents.news_agent import run as news_run
from agents.price_agent import run as price_run
from agents.signal_agent import run as signal_run
from agents.technical_agent import run as technical_run


async def research(metal: str, market: str) -> dict:
    price_data, news_data, technical_data = await asyncio.gather(
        price_run(metal, market),
        news_run(metal),
        technical_run(metal, market),
    )
    return await signal_run(metal, market, price_data, news_data, technical_data)
