import asyncio
import json

from streaming.log_queue import subscribe, unsubscribe


async def log_event_generator():
    q = subscribe()
    try:
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=25.0)
                yield {"data": json.dumps(event)}
            except asyncio.TimeoutError:
                yield {"data": json.dumps({"type": "ping"})}
    finally:
        unsubscribe(q)
