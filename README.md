# Agentic AI Researcher for Trading

An autonomous full-stack research system that dispatches parallel AI agents to gather live prices, scan financial news, and run technical analysis — then synthesises everything into a structured **BUY / SELL / HOLD** signal with real-time log streaming to the browser.

Covers **Gold, Silver, Copper, Uranium, and Zinc** across **COMEX / LME** (US) and **MCX** (India) markets.

---

## Demo

```
[Price Agent]      🔍 Reason    Fetching live COMEX price for GOLD
[News Agent]       🔍 Reason    Searching macro news for GOLD
[Technical Agent]  🔍 Reason    Loading historical GOLD price data
[Price Agent]      ⚙  Act       get_live_price({"metal":"GOLD","market":"COMEX"})
[News Agent]       ⚙  Act       search_news({"query":"gold price macro 2025"})
[Price Agent]      👁  Observe   {"price": 2345.50, "change_pct": 1.2, ...}
[Technical Agent]  ⚙  Act       get_technical_indicators({"metal":"GOLD",...})
[News Agent]       👁  Observe   Fed pause narrative dominant — bullish
[Technical Agent]  👁  Observe   RSI 42 — approaching oversold
[Signal Agent]     🔍 Reason    Synthesising price + sentiment + technical data
[Signal Agent]     ✅  Output    BUY GOLD COMEX — confidence 0.78
```

---

## Architecture

```
Browser
  │
  ├─ POST /api/trigger ──► Next.js proxy ──► FastAPI /research
  │                                               │
  │                              ┌────────────────┼────────────────┐
  │                              ▼                ▼                ▼
  │                         Price Agent      News Agent    Technical Agent
  │                         (yfinance)     (web search)    (historical CSV
  │                         USD + INR       sentiment      RSI/MACD/MAs)
  │                              └────────────────┼────────────────┘
  │                                               ▼
  │                                         Signal Agent
  │                                    (Claude tool-forced
  │                                     BUY/SELL/HOLD JSON)
  │
  └─ GET /stream/logs ◄── SSE ◄── shared async broadcast queue
         (LogPanel)                 (every ReAct step emitted live)
```

Each agent runs a **raw ReAct loop** (Reason → Act → Observe → repeat) using the Anthropic SDK's tool-use API — no agent framework dependencies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Python 3.11+ · FastAPI · uvicorn |
| AI | Claude (Anthropic SDK) — raw ReAct, no framework |
| Market data | yfinance (COMEX/LME futures) |
| News search | DuckDuckGo Search (no API key required) |
| Log streaming | Server-Sent Events (SSE) |
| Deployment | Render (2 persistent Web Services) |

---

## Project Structure

```
.
├── backend/
│   ├── main.py                   # FastAPI app — /research, /stream/logs, /health
│   ├── orchestrator.py           # asyncio.gather() → 3 parallel agents → signal
│   ├── agents/
│   │   ├── react_runner.py       # Shared ReAct loop (tool-use + log broadcast)
│   │   ├── price_agent.py        # Live price + USD/INR conversion
│   │   ├── news_agent.py         # Multi-query news search + sentiment
│   │   ├── technical_agent.py    # RSI, MACD, MA50/200, support/resistance
│   │   └── signal_agent.py       # Forced tool-call → structured signal JSON
│   ├── tools/
│   │   ├── price_feed.py         # yfinance wrapper (GC=F, SI=F, HG=F, URA, ZNC=F)
│   │   ├── currency_converter.py # Live USD/INR via USDINR=X
│   │   ├── web_search.py         # DuckDuckGo search
│   │   └── filesystem.py         # Historical CSV cache + technical indicator calc
│   ├── streaming/
│   │   ├── log_queue.py          # Multi-subscriber async broadcast queue
│   │   └── sse.py                # SSE event generator (25s keepalive ping)
│   ├── data/historical/          # Auto-downloaded 1-year price CSVs (gitignored)
│   ├── outputs/signals/          # Generated signal JSONs (gitignored)
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                  # Main dashboard
│       │   └── api/trigger/route.ts      # Server-side proxy to backend
│       ├── components/
│       │   ├── MetalSelector.tsx         # 5-metal radio group
│       │   ├── MarketToggle.tsx          # COMEX / MCX toggle
│       │   ├── LogPanel.tsx              # Live SSE log stream
│       │   └── SignalCard.tsx            # BUY/SELL/HOLD result card
│       └── lib/
│           ├── useSSE.ts                 # EventSource hook
│           └── types.ts                  # TypeScript interfaces
│
├── ARCHITECTURE.md
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/Scripts/activate      # Git Bash / Mac/Linux
# or: .venv\Scripts\Activate.ps1   # PowerShell

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# Start the server
uvicorn main:app --reload
# → http://localhost:8000
```

### Frontend

```bash
cd frontend

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_BACKEND_URL and BACKEND_URL default to http://localhost:8000

# Install and run
npm install
npm run dev
# → http://localhost:3000
```

---

## Signal Output

```json
{
  "asset": "GOLD",
  "market": "COMEX",
  "signal": "BUY",
  "confidence": 0.78,
  "rationale": "Bullish sentiment on Fed pause + RSI approaching oversold + price above 200MA",
  "price_summary": "Spot at $2345.50, +1.2% on the day. INR equivalent ₹195,200.",
  "technical_summary": "RSI 42, MACD bullish crossover, price above MA50 and MA200.",
  "sentiment_summary": "Macro news skews bullish — Fed pause narrative dominant.",
  "risk_flags": ["Elevated geopolitical uncertainty", "Thin liquidity ahead of NFP"],
  "price_data": { "price": 2345.50, "change_pct": 1.2, "price_inr": 195200 },
  "technical_data": { "rsi": 42, "macd_crossover": "bullish", "trend": "uptrend" },
  "news_data": { "sentiment_score": 0.65, "bias": "bullish" },
  "generated_at": "2025-05-09T08:00:00Z"
}
```

Signals are also saved as JSON files to `backend/outputs/signals/`.

---

## Metals Coverage

| Metal | US Ticker | Indian Market | Notes |
|---|---|---|---|
| Gold | `GC=F` (COMEX) | MCX | — |
| Silver | `SI=F` (COMEX) | MCX | — |
| Copper | `HG=F` (COMEX) | MCX | Industrial bellwether |
| Uranium | `URA` (ETF proxy) | — | MCX does not trade Uranium |
| Zinc | `ZNC=F` (COMEX) | MCX | — |

> MCX prices are derived from COMEX USD prices × live USD/INR rate. Direct MCX feed requires a commercial data provider.

---

## Deployment (Render)

Two persistent Web Services — no serverless, since SSE requires long-lived connections.

| Service | Root Dir | Start Command |
|---|---|---|
| `art-backend` | `backend/` | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| `art-frontend` | `frontend/` | `npm run build && npm start` |

**Backend env vars:** `ANTHROPIC_API_KEY`, `LLM_MODEL`  
**Frontend env vars:** `NEXT_PUBLIC_BACKEND_URL`, `BACKEND_URL` → set to the backend Render URL

---

## Roadmap

- [ ] Equity indices: Nifty 50, S&P 500
- [ ] WhatsApp / Telegram signal delivery
- [ ] Daily digest via scheduled cron job
- [ ] Backtesting module
- [ ] Portfolio tracker
- [ ] Multi-user authentication
