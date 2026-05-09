# Agentic AI Researcher for Trading
### ARCHITECTURE.md — Version 1.0

---

## Project Overview
A full-stack agentic research system that autonomously gathers, reasons over, and synthesizes
market data to generate buy/sell signals for **Gold, Silver, Copper, Uranium, and Zinc** across
US (COMEX/LME) and Indian (MCX) markets.

The system features a **Next.js frontend** with metal selector and real-time log streaming panel,
powered by a **FastAPI backend** running parallel autonomous ReAct agents connected via
**MCP tool protocol**.

---

## Monorepo Structure

```
agentic-researcher-trading/
├── ARCHITECTURE.md
├── README.md
├── .gitignore
│
├── frontend/                        # Next.js App
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── .env.local
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Main dashboard
│       │   ├── layout.tsx
│       │   └── api/
│       │       └── trigger/
│       │           └── route.ts     # Proxy to backend
│       ├── components/
│       │   ├── MetalSelector.tsx    # Radio group: 5 metals
│       │   ├── LogPanel.tsx         # Real-time SSE log stream
│       │   ├── SignalCard.tsx       # BUY/SELL/HOLD output
│       │   └── MarketToggle.tsx     # COMEX / MCX toggle
│       └── lib/
│           └── useSSE.ts            # SSE hook for log streaming
│
├── backend/                         # FastAPI App
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                      # FastAPI entry point
│   ├── orchestrator.py              # Master ReAct coordinator
│   ├── agents/
│   │   ├── price_agent.py           # Fetches live prices
│   │   ├── news_agent.py            # Sentiment from news
│   │   ├── technical_agent.py       # RSI, MACD, MAs
│   │   └── signal_agent.py          # Final synthesis
│   ├── tools/                       # MCP tool wrappers
│   │   ├── web_search.py
│   │   ├── price_feed.py
│   │   ├── currency_converter.py
│   │   └── filesystem.py
│   ├── streaming/
│   │   ├── log_queue.py             # Shared async queue
│   │   └── sse.py                   # SSE event emitter
│   ├── data/
│   │   └── historical/              # CSV price history per metal
│   └── outputs/
│       └── signals/                 # Generated signal JSONs
```

---

## Metals Coverage

| Metal   | US Market | Indian Market | Notes                          |
|---------|-----------|---------------|--------------------------------|
| Gold    | COMEX     | MCX           | Both liquid markets            |
| Silver  | COMEX     | MCX           | Both liquid markets            |
| Copper  | COMEX     | MCX           | Industrial bellwether          |
| Uranium | OTC/Spot  | —             | MCX does not trade Uranium     |
| Zinc    | LME       | MCX           | London Metal Exchange for US   |

---

## Core Concept: ReAct Loop
Every agent follows the ReAct pattern autonomously:

```
1. Reason  → think about what is needed
2. Act     → call an MCP tool
3. Observe → evaluate the result
4. Repeat  → refine until confident
5. Output  → return structured result to orchestrator
```

Each step emits a structured log event to the shared async queue,
streamed live to the frontend logging panel via SSE.

---

## Agent Architecture

### Orchestrator (`orchestrator.py`)
- Single entry point — receives metal + market selection from frontend
- Launches Price, News, and Technical agents **in parallel** via `asyncio.gather()`
- Waits for all three, then passes combined results to Signal agent
- Streams final signal back to frontend

```python
async def run(metal, market):
    price, news, technical = await asyncio.gather(
        price_agent(metal, market),
        news_agent(metal),
        technical_agent(metal, market)
    )
    signal = await signal_agent(price, news, technical)
    return signal
```

### Agent Execution Model

| Agent            | Type           | Runs                          |
|------------------|----------------|-------------------------------|
| Price Agent      | async function | Parallel (asyncio.gather)     |
| News Agent       | async function | Parallel (asyncio.gather)     |
| Technical Agent  | async function | Parallel (asyncio.gather)     |
| Signal Agent     | async function | Sequential (after all 3)      |

### Agent Descriptions

#### 1. Price Agent (`price_agent.py`)
- Fetches live and historical prices for selected metal
- Converts USD ↔ INR where applicable
- MCP Tools: `price_feed`, `currency_converter`
- ReAct iterations: 2–3
- Output: `{ price, change_pct, high_24h, low_24h, currency }`

#### 2. News & Sentiment Agent (`news_agent.py`)
- Searches macro and metal-specific news
- Reasons over headlines for bullish/bearish sentiment
- MCP Tools: `web_search`
- ReAct iterations: 3–4 (refines search queries autonomously)
- Output: `{ sentiment_score, bias, key_headlines[] }`

#### 3. Technical Analysis Agent (`technical_agent.py`)
- Reads historical CSV data for selected metal
- Calculates: RSI, MACD, 50MA, 200MA, Support/Resistance
- Reasons about trend direction and momentum
- MCP Tools: `filesystem`
- ReAct iterations: 2–3
- Output: `{ rsi, macd, trend, bias, key_levels }`

#### 4. Signal Synthesis Agent (`signal_agent.py`)
- Receives outputs from all 3 agents above
- Reasons holistically: price + sentiment + technical data
- Generates final structured signal with confidence and rationale
- No MCP tools — pure reasoning over structured inputs
- ReAct iterations: 1–2
- Output: Final signal JSON

---

## Tool Layer (MCP)

| Tool                | File                          | Used By          | Purpose                     |
|---------------------|-------------------------------|------------------|-----------------------------|
| web_search          | `tools/web_search.py`         | News Agent       | Fetch latest headlines      |
| price_feed          | `tools/price_feed.py`         | Price Agent      | Live COMEX / MCX / LME      |
| currency_converter  | `tools/currency_converter.py` | Price Agent      | USD ↔ INR conversion        |
| filesystem          | `tools/filesystem.py`         | Technical Agent  | Read/write historical CSVs  |

---

## Observability & Log Streaming

### Shared Async Queue (`streaming/log_queue.py`)
Every agent emits structured log events at each ReAct step:

```python
await log_queue.put({
    "agent": "Price",
    "step": "Reason",
    "metal": "GOLD",
    "msg": "Fetching live COMEX price for GOLD",
    "ts": "2025-05-09T08:00:01Z"
})
```

### SSE Endpoint (`/stream/logs`)
FastAPI drains the queue and streams events to the frontend:

```python
@app.get("/stream/logs")
async def stream_logs():
    async def event_generator():
        while True:
            event = await log_queue.get()
            yield f"data: {json.dumps(event)}\n\n"
    return EventSourceResponse(event_generator())
```

### Frontend Log Panel — Live Output Example
```
[Price Agent]      🔍 Reason    Fetching live COMEX price for GOLD
[News Agent]       🔍 Reason    Searching macro news for GOLD
[Technical Agent]  🔍 Reason    Loading historical GOLD price data
[Price Agent]      ⚙️  Act      Calling price_feed tool
[News Agent]       ⚙️  Act      web_search → "gold prices macro 2025"
[Price Agent]      👁  Observe   $2345.50 received, +1.2% 24h
[Technical Agent]  ⚙️  Act      Reading GOLD_COMEX_historical.csv
[News Agent]       👁  Observe   Fed pause narrative dominant — bullish
[Technical Agent]  👁  Observe   RSI 42 — approaching oversold
[Signal Agent]     🔍 Reason    Synthesizing price + sentiment + technical
[Signal Agent]     ✅  Output    BUY GOLD COMEX — confidence 0.78
```

---

## Signal Output Format

```json
{
  "asset": "GOLD",
  "market": "COMEX",
  "signal": "BUY",
  "confidence": 0.78,
  "price_usd": 2345.50,
  "price_inr": 195200,
  "technical": {
    "rsi": 42,
    "macd": "bullish_crossover",
    "trend": "above_200MA"
  },
  "sentiment": {
    "score": 0.65,
    "bias": "bullish",
    "headline": "Fed signals pause in rate hikes"
  },
  "rationale": "Bullish sentiment on Fed pause + RSI approaching oversold + price above 200MA",
  "generated_at": "2025-05-09T08:00:00Z"
}
```

---

## Frontend UI (`frontend/`)

| Component             | Purpose                                                        |
|-----------------------|----------------------------------------------------------------|
| `MetalSelector.tsx`   | Radio group — Gold / Silver / Copper / Uranium / Zinc          |
| `MarketToggle.tsx`    | Toggle — COMEX / MCX (MCX disabled for Uranium)               |
| `LogPanel.tsx`        | Real-time SSE log stream, color-coded by agent and step type   |
| `SignalCard.tsx`      | Final BUY / SELL / HOLD card with confidence + rationale       |

### SSE Hook (`useSSE.ts`)
```typescript
const { logs, isStreaming } = useSSE("/api/stream/logs");
```

---

## Deployment (Render)

### Two Render Web Services (not serverless — persistent servers)

| Service         | Type        | Root Dir    | Start Command              |
|-----------------|-------------|-------------|----------------------------|
| `art-frontend`  | Web Service | `frontend/` | `npm run build && npm start`|
| `art-backend`   | Web Service | `backend/`  | `uvicorn main:app --host 0.0.0.0` |

### Environment Variables

**Backend (`backend/.env`)**
```
ANTHROPIC_API_KEY=
PRICE_FEED_API_KEY=
EMAIL_FROM=
EMAIL_TO=
```

**Frontend (`frontend/.env.local`)**
```
NEXT_PUBLIC_BACKEND_URL=https://art-backend.onrender.com
```

---

## Stack Summary

| Layer                | Technology                                      |
|----------------------|-------------------------------------------------|
| Frontend             | Next.js 14 (App Router) + Tailwind CSS          |
| Backend              | Python 3.11 + FastAPI                           |
| Agent Orchestration  | Anthropic SDK — raw ReAct loop, no frameworks   |
| Tool Protocol        | MCP (Model Context Protocol)                    |
| Parallelism          | asyncio.gather()                                |
| Log Streaming        | SSE (Server-Sent Events) FastAPI → Next.js      |
| Deployment           | Render (2 persistent Web Services)              |
| Version Control      | GitHub (monorepo)                               |

---

## V1.0 Scope
- 5 metals: Gold, Silver, Copper, Uranium, Zinc
- US (COMEX / LME) and India (MCX) markets
- 4 parallel async agents with real-time log streaming
- Next.js dashboard: metal selector + market toggle + log panel + signal card
- Manual trigger via frontend Run button
- Daily digest via Render Cron Job

## Future Scope (V2+)
- Equity indices: Nifty 50, S&P 500
- WhatsApp / Telegram signal delivery
- WebSocket live streaming signals
- Backtesting module
- Portfolio tracker
- Multi-user authentication
