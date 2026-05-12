import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Agentic AI Researcher for Trading (MCP)",
};

/* ── small layout helpers ──────────────────────────────────────── */

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`max-w-4xl mx-auto px-6 py-10 ${className}`}>
      {children}
    </section>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${color}`}>
      {children}
    </span>
  );
}

function Step({
  n, title, children,
}: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm">
          {n}
        </div>
        <div className="w-px flex-1 bg-gray-800 mt-2" />
      </div>
      <div className="pb-10">
        <h3 className="text-white font-bold text-base mb-2">{title}</h3>
        <div className="text-gray-400 text-sm leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  );
}

/* ── flow diagram ───────────────────────────────────────────────── */

function DiagramBox({
  children, color = "border-gray-700 bg-gray-900", textColor = "text-gray-200",
}: { children: React.ReactNode; color?: string; textColor?: string }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-center text-xs font-mono ${color} ${textColor}`}>
      {children}
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-px h-5 bg-gray-700" />
      {label && <span className="text-gray-600 text-xs mb-1">{label}</span>}
      <div className="text-gray-600 text-xs">▼</div>
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────────── */

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono">

      {/* ── Hero ── */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-emerald-400 text-xs uppercase tracking-widest mb-3">
            Agentic AI Researcher for Trading (MCP)
          </p>
          <h1 className="text-3xl font-bold text-white mb-4">
            How does it work?
          </h1>
          <div className="flex flex-wrap gap-3 mb-5">
            <span className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-300 font-bold text-sm tracking-wide">
              🤖 Agentic AI
            </span>
            <span className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/50 text-purple-300 font-bold text-sm tracking-wide">
              🔌 MCP — Model Context Protocol
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            A plain-English walkthrough of the system — written for Hiring Managers,
            Engineering leads, and anyone who wants to understand the architecture
            without reading the source code.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              ["Agentic AI",       "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"],
              ["MCP Tools",        "bg-purple-500/20  text-purple-400  border border-purple-500/40" ],
              ["Real-time SSE",    "bg-blue-500/20    text-blue-400    border border-blue-500/40"   ],
              ["Parallel Agents",  "bg-cyan-500/20    text-cyan-400    border border-cyan-500/40"   ],
              ["FastAPI + Next.js","bg-yellow-500/20  text-yellow-400  border border-yellow-500/40" ],
              ["Claude AI",        "bg-pink-500/20    text-pink-400    border border-pink-500/40"   ],
              ["True Abort",       "bg-red-500/20     text-red-400     border border-red-500/40"    ],
            ].map(([label, cls]) => (
              <Tag key={label} color={cls}>{label}</Tag>
            ))}
          </div>
        </div>
      </header>

      {/* ── What it does ── */}
      <Section>
        <h2 className="text-lg font-bold text-white mb-6">What this system does</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["📡", "Fetches live prices",      "Pulls real-time commodity prices for Gold, Silver, Copper, Uranium & Zinc from COMEX/LME markets using financial APIs."],
            ["📰", "Scans financial news",     "Autonomously searches the web for macro news, supply/demand drivers, and geopolitical factors affecting each metal."],
            ["📈", "Runs technical analysis",  "Calculates RSI, MACD, 50-day & 200-day moving averages, support and resistance levels from a year of historical data."],
            ["🎯", "Generates a signal",       "Synthesises all three data sources using Claude AI to produce a structured BUY / SELL / HOLD signal with a confidence score and rationale."],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-white font-bold text-sm mb-1">{title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Agentic + MCP spotlight ── */}
      <Section className="border-t border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Agentic */}
          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-6">
            <div className="text-emerald-400 text-2xl font-bold mb-3 tracking-tight">
              🤖 What is &ldquo;Agentic&rdquo; AI?
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              A traditional AI call is a single round-trip: you send a prompt, you get an answer.
              An <span className="text-emerald-300 font-bold">Agentic</span> AI system is different —
              each agent <em>autonomously decides</em> what to do next, acts on that decision,
              observes the result, and loops until it is confident in its output.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              In this system, four agents operate independently. None of them are given a script.
              They reason, choose tools, call APIs, read results, and iterate — just like a human
              analyst would work through a research problem.
            </p>
            <div className="space-y-2">
              {[
                ["Reason",  "emerald", "What do I need to find out?"],
                ["Act",     "yellow",  "Call the right tool to get it"],
                ["Observe", "blue",    "Was that enough? What's next?"],
                ["Output",  "emerald", "Confident — return structured result"],
              ].map(([step, color, desc]) => (
                <div key={step as string} className="flex gap-3 text-xs">
                  <span className={`shrink-0 w-16 font-bold text-${color}-400`}>{step}</span>
                  <span className="text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MCP */}
          <div className="bg-purple-950/40 border border-purple-700/50 rounded-xl p-6">
            <div className="text-purple-300 text-2xl font-bold mb-3 tracking-tight">
              🔌 MCP — Model Context Protocol
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              <span className="text-purple-300 font-bold">MCP</span> is the standard protocol
              through which AI agents call external tools. Instead of hardcoding API calls inside
              the model logic, each capability is exposed as a named, schema-validated tool that
              Claude can discover and call by name.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              This project implements four MCP tools. Claude decides <em>when</em> to call them and
              <em> what arguments</em> to pass — the system just executes and returns the result.
            </p>
            <div className="space-y-2">
              {[
                ["price_feed",          "Live COMEX / LME commodity prices via yfinance"],
                ["currency_converter",  "Real-time USD → INR exchange rate"],
                ["web_search",          "DuckDuckGo news search — no API key needed"],
                ["get_tech_indicators", "RSI, MACD, MA50/200 from historical CSV data"],
              ].map(([tool, desc]) => (
                <div key={tool as string} className="flex gap-3 text-xs">
                  <code className="shrink-0 text-purple-300 w-36">{tool}</code>
                  <span className="text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* ── Workflow diagram ── */}
      <Section>
        <h2 className="text-lg font-bold text-white mb-8">Workflow Diagram</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">

          {/* Browser */}
          <div className="flex justify-center mb-1">
            <DiagramBox color="border-gray-600 bg-gray-800" textColor="text-gray-200">
              <div className="font-bold mb-0.5">🖥  Browser — Next.js Dashboard</div>
              <div className="text-gray-500 text-xs">User selects metal + market → clicks Run Research</div>
            </DiagramBox>
          </div>

          <Arrow label="POST /api/trigger" />

          {/* Orchestrator */}
          <div className="flex justify-center mb-1">
            <DiagramBox color="border-blue-700 bg-blue-950/40" textColor="text-blue-300">
              <div className="font-bold mb-0.5">⚡  FastAPI Orchestrator</div>
              <div className="text-blue-400/70 text-xs">asyncio.gather() — launches 3 agents simultaneously</div>
            </DiagramBox>
          </div>

          {/* Fork label */}
          <div className="flex flex-col items-center my-1">
            <div className="w-px h-3 bg-gray-700" />
            <div className="text-gray-600 text-xs mb-1">runs in parallel ↓</div>
          </div>

          {/* Horizontal connector */}
          <div className="relative flex justify-center mb-1">
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gray-700" />
            <div className="flex gap-4 w-full pt-0">

              {/* Price Agent */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-px h-4 bg-gray-700" />
                <div className="w-full">
                  <DiagramBox color="border-yellow-700/60 bg-yellow-950/30" textColor="text-yellow-300">
                    <div className="font-bold mb-1">💰 Price Agent</div>
                    <div className="text-yellow-400/60 text-xs leading-relaxed">
                      Fetches live COMEX / MCX price<br />
                      Converts USD → INR<br />
                      Tools: price_feed, currency_converter
                    </div>
                  </DiagramBox>
                </div>
              </div>

              {/* News Agent */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-px h-4 bg-gray-700" />
                <div className="w-full">
                  <DiagramBox color="border-blue-700/60 bg-blue-950/30" textColor="text-blue-300">
                    <div className="font-bold mb-1">📰 News Agent</div>
                    <div className="text-blue-400/60 text-xs leading-relaxed">
                      Multi-query web search<br />
                      Scores sentiment −1.0 → +1.0<br />
                      Tool: web_search (DuckDuckGo)
                    </div>
                  </DiagramBox>
                </div>
              </div>

              {/* Technical Agent */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-px h-4 bg-gray-700" />
                <div className="w-full">
                  <DiagramBox color="border-purple-700/60 bg-purple-950/30" textColor="text-purple-300">
                    <div className="font-bold mb-1">📈 Technical Agent</div>
                    <div className="text-purple-400/60 text-xs leading-relaxed">
                      Reads 1-year historical CSV<br />
                      Calculates RSI, MACD, MA50/200<br />
                      Tool: get_technical_indicators
                    </div>
                  </DiagramBox>
                </div>
              </div>

            </div>
          </div>

          {/* Join */}
          <div className="relative flex justify-center my-1">
            <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gray-700" />
            <div className="flex gap-4 w-full pb-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 flex justify-center">
                  <div className="w-px h-4 bg-gray-700" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center my-1">
            <div className="text-gray-600 text-xs mb-1">all 3 results collected ↓</div>
            <div className="text-gray-600 text-xs">▼</div>
          </div>

          {/* Signal Agent */}
          <div className="flex justify-center mb-1">
            <DiagramBox color="border-emerald-700 bg-emerald-950/40" textColor="text-emerald-300">
              <div className="font-bold mb-0.5">🎯  Signal Synthesis Agent (Claude AI)</div>
              <div className="text-emerald-400/70 text-xs">
                Reasons over price + sentiment + technical data<br />
                Forced tool call → structured JSON output
              </div>
            </DiagramBox>
          </div>

          <Arrow />

          {/* Output */}
          <div className="flex justify-center mb-6">
            <DiagramBox color="border-white/20 bg-gray-800" textColor="text-white">
              <div className="font-bold text-base mb-0.5">
                <span className="text-emerald-400">BUY</span>
                {" / "}
                <span className="text-red-400">SELL</span>
                {" / "}
                <span className="text-yellow-400">HOLD</span>
              </div>
              <div className="text-gray-400 text-xs">
                with confidence score, rationale, risk flags & price data
              </div>
            </DiagramBox>
          </div>

          {/* SSE callout */}
          <div className="border-t border-gray-800 pt-4 flex items-start gap-3">
            <span className="text-blue-400 text-lg shrink-0">⚡</span>
            <p className="text-gray-500 text-xs leading-relaxed">
              <span className="text-blue-400 font-bold">Throughout the entire run</span>{" "}
              — every single Reason / Act / Observe step from every agent is broadcast in real-time
              to the browser via{" "}
              <span className="text-white">Server-Sent Events (SSE)</span>.
              The Log Panel updates live as agents think and act, giving full
              transparency into the AI reasoning process.
            </p>
          </div>

          {/* Abort callout */}
          <div className="border-t border-gray-800 pt-4 mt-3 flex items-start gap-3">
            <span className="text-red-400 text-lg shrink-0">⛔</span>
            <p className="text-gray-500 text-xs leading-relaxed">
              <span className="text-red-400 font-bold">At any point</span>{" "}
              the user can click <span className="text-white">Abort</span> — the browser calls{" "}
              <code className="text-red-300">POST /abort</code>, which cancels the running{" "}
              <code className="text-white">asyncio.Task</code> on the server.
              Python&apos;s <code className="text-white">CancelledError</code> propagates automatically
              through <code className="text-yellow-300">asyncio.gather()</code> — stopping all three
              parallel agents simultaneously. An <span className="text-red-400">⛔ Aborted</span> event
              is broadcast to the SSE stream and the UI resets instantly to step 0.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Step by step ── */}
      <Section>
        <h2 className="text-lg font-bold text-white mb-8">Step-by-step breakdown</h2>
        <div>
          <Step n={1} title="User selects a metal and market">
            <p>The Next.js dashboard presents five metals (Gold, Silver, Copper, Uranium, Zinc) and two markets (COMEX for US, MCX for India). Uranium on MCX is automatically disabled since it is not traded there.</p>
          </Step>

          <Step n={2} title="Browser sends a POST request to the Next.js proxy">
            <p>Clicking <strong className="text-white">Run Research</strong> fires a POST to <code className="text-emerald-400">/api/trigger</code> — a server-side Next.js route that forwards the request to the FastAPI backend. Keeping this server-side avoids exposing the backend URL directly in the browser bundle.</p>
          </Step>

          <Step n={3} title="The Orchestrator launches three agents in parallel">
            <p>
              FastAPI&apos;s orchestrator calls Python&apos;s <code className="text-yellow-400">asyncio.gather()</code> to fire the Price Agent, News Agent, and Technical Agent simultaneously. They run in parallel — not one after another — cutting total latency by roughly 3×.
            </p>
          </Step>

          <Step n={4} title="Each agent runs an autonomous ReAct loop — this is what makes it Agentic">
            <p>
              This is the heart of what makes the system <span className="text-emerald-400 font-bold">Agentic</span> — agents
              don&apos;t just answer once, they loop autonomously using the{" "}
              <strong className="text-white">ReAct pattern</strong> (Reason → Act → Observe → repeat),
              calling <span className="text-purple-400 font-bold">MCP tools</span> at each Act step:
            </p>
            <ul className="mt-2 space-y-1 pl-4">
              {[
                ["🔍 Reason",  "Claude decides what information it needs"],
                ["⚙  Act",     "It calls an MCP tool (price API, web search, or CSV reader)"],
                ["👁  Observe", "It reads the tool result and decides whether to act again"],
                ["✅  Output",  "When confident, it returns a structured result"],
              ].map(([step, desc]) => (
                <li key={step as string} className="flex gap-2">
                  <span className="text-yellow-400 shrink-0 w-24">{step}</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </Step>

          <Step n={5} title="Live logs stream to the browser via SSE">
            <p>
              Every ReAct step emits a structured event to a shared async broadcast queue. A <strong className="text-white">Server-Sent Events</strong> endpoint drains that queue and pushes each event to all connected browsers in real-time. The Log Panel displays agent name, step type, and message as they happen — no polling, no WebSocket, just a lightweight persistent HTTP stream.
            </p>
          </Step>

          <Step n={6} title="The Signal Agent synthesises all three outputs">
            <p>
              Once all three parallel agents complete, Claude&apos;s Signal Agent receives their structured outputs together. It reasons holistically — weighing price momentum, sentiment bias, and technical indicators — then is <strong className="text-white">forced</strong> to call a <code className="text-emerald-400">submit_signal</code> tool, ensuring the output is always a typed JSON object rather than free text.
            </p>
          </Step>

          <Step n={7} title="The signal is returned, displayed, and saved">
            <p>
              The final signal JSON — including the BUY/SELL/HOLD direction, confidence score, rationale, risk flags, and all underlying data — is returned to the browser and rendered in the Signal Card. A copy is also saved locally to <code className="text-purple-400">outputs/signals/</code> for record-keeping.
            </p>
          </Step>

          <Step n={8} title="At any point: Abort">
            <p>
              While research is running, the <strong className="text-white">Run Research</strong> button
              is replaced by an <span className="text-red-400 font-bold">⛔ Abort</span> button.
              Clicking it fires <code className="text-red-300">POST /api/abort</code> to the Next.js proxy,
              which forwards to <code className="text-red-300">POST /abort</code> on FastAPI.
            </p>
            <p className="mt-2">
              The backend calls <code className="text-white">task.cancel()</code> on the stored{" "}
              <code className="text-white">asyncio.Task</code>. Python raises{" "}
              <code className="text-white">CancelledError</code> at the next{" "}
              <code className="text-yellow-300">await</code> inside{" "}
              <code className="text-yellow-300">asyncio.gather()</code> — which automatically cancels
              all three running agents at once. The backend broadcasts an{" "}
              <span className="text-red-400">⛔ Aborted</span> log event and the UI resets to step 0,
              leaving the log panel visible so the user can see how far the agents got.
            </p>
            <p className="mt-2 text-gray-600 text-xs italic">
              Note: tool calls running in thread pools (yfinance, DuckDuckGo) cannot be killed mid-thread
              — they finish in the background, but their results are discarded since the awaiting
              coroutine is already cancelled.
            </p>
          </Step>
        </div>
      </Section>

      {/* ── Why it's interesting ── */}
      <Section className="border-t border-gray-800">
        <h2 className="text-lg font-bold text-white mb-6">Why this is technically interesting</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "No agent framework",
              desc:  "The ReAct loop is implemented from scratch using the Anthropic SDK's tool-use API — no LangChain, no CrewAI. This means full control, no hidden abstractions, and a clear mental model of what the LLM is doing at every step.",
              color: "border-l-yellow-500",
            },
            {
              title: "Forced structured output",
              desc:  "The Signal Agent uses tool_choice: 'any' to guarantee it always calls submit_signal. The LLM physically cannot return free text — it must produce valid typed JSON. This is a key reliability technique for production AI systems.",
              color: "border-l-emerald-500",
            },
            {
              title: "True parallelism",
              desc:  "Three agents run concurrently via asyncio.gather(). Each agent may make multiple LLM calls and tool calls internally. Total wall-clock time ≈ the slowest single agent, not the sum of all three.",
              color: "border-l-blue-500",
            },
            {
              title: "Multi-subscriber SSE broadcast",
              desc:  "The log queue supports multiple simultaneous browser connections. When an agent broadcasts an event, it lands in every subscriber's queue — multiple browser tabs all see the same live stream independently.",
              color: "border-l-purple-500",
            },
            {
              title: "True async cancellation",
              desc:  "Abort doesn't just hide the UI — it cancels the real server-side asyncio.Task. CancelledError propagates through asyncio.gather() and stops every parallel agent simultaneously. The running task reference is stored on app.state so any request can cancel it cleanly.",
              color: "border-l-red-500",
            },
          ].map(({ title, desc, color }) => (
            <div key={title} className={`bg-gray-900 border border-gray-800 border-l-2 ${color} rounded-lg p-4`}>
              <div className="text-white font-bold text-sm mb-2">{title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Stack ── */}
      <Section className="border-t border-gray-800">
        <h2 className="text-lg font-bold text-white mb-6">Full stack at a glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ["Frontend",        "Next.js 14 (App Router)",    "text-blue-400"   ],
            ["Styling",         "Tailwind CSS",               "text-cyan-400"   ],
            ["Backend",         "FastAPI + uvicorn",          "text-green-400"  ],
            ["Language",        "Python 3.11+",               "text-yellow-400" ],
            ["AI Model",        "Claude (Anthropic SDK)",     "text-pink-400"   ],
            ["Market Data",     "yfinance (COMEX / LME)",     "text-orange-400" ],
            ["News Search",     "DuckDuckGo (no API key)",    "text-gray-300"   ],
            ["Log Streaming",   "Server-Sent Events (SSE)",   "text-purple-400" ],
            ["Deployment",      "Render (2 Web Services)",    "text-emerald-400"],
          ].map(([layer, tech, color]) => (
            <div key={layer as string} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-gray-600 text-xs mb-1">{layer}</div>
              <div className={`font-bold text-xs ${color}`}>{tech}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center">
        <p className="text-gray-700 text-xs">
          Built with the Anthropic Claude API · Next.js · FastAPI
        </p>
      </footer>

    </div>
  );
}
