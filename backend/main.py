import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from mcp_client import start_mcp_server, stop_mcp_server
from orchestrator import research
from streaming.log_queue import broadcast
from streaming.sse import log_event_generator


@asynccontextmanager
async def lifespan(app: FastAPI):
    await start_mcp_server()
    app.state.current_task = None
    yield
    await stop_mcp_server()


app = FastAPI(title="Agentic AI Researcher for Trading", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    metal: str
    market: str


@app.post("/research")
async def trigger_research(req: ResearchRequest):
    app.state.current_task = asyncio.current_task()
    try:
        return await research(req.metal.upper(), req.market.upper())
    except asyncio.CancelledError:
        raise
    finally:
        app.state.current_task = None


@app.post("/abort")
async def abort_research():
    task: asyncio.Task | None = app.state.current_task
    if task and not task.done():
        task.cancel()
        await broadcast({
            "agent": "System",
            "step": "Aborted",
            "metal": "—",
            "msg": "Research aborted by user",
            "ts": datetime.now(timezone.utc).isoformat(),
        })
        return {"aborted": True}
    return {"aborted": False, "reason": "no_active_research"}


@app.get("/stream/logs")
async def stream_logs():
    return EventSourceResponse(log_event_generator())


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Agentic AI Researcher for Trading (MCP)"}
