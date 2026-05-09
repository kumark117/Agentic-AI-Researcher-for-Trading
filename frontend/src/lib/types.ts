export type Metal = "GOLD" | "SILVER" | "COPPER" | "URANIUM" | "ZINC";
export type Market = "COMEX" | "MCX";
export type SignalDirection = "BUY" | "SELL" | "HOLD";

export interface LogEvent {
  agent: string;
  step: string;
  metal: string;
  msg: string;
  ts: string;
  type?: string;
}

export interface PriceData {
  price: number;
  change_pct: number;
  high_24h: number;
  low_24h: number;
  currency: string;
  price_inr: number | null;
  error?: string;
}

export interface MacdData {
  macd: number;
  signal: number;
  histogram: number;
  crossover: "bullish" | "bearish";
}

export interface TechnicalData {
  rsi: number;
  rsi_signal: string;
  macd_crossover: string;
  macd?: MacdData;
  trend: string;
  above_ma50: boolean;
  above_ma200: boolean | null;
  support: number;
  resistance: number;
  bias: string;
  key_observation: string;
  error?: string;
}

export interface NewsData {
  sentiment_score: number;
  bias: string;
  key_headlines: string[];
  summary: string;
  error?: string;
}

export interface Signal {
  asset: Metal;
  market: Market;
  signal: SignalDirection;
  confidence: number;
  rationale: string;
  price_summary: string;
  technical_summary: string;
  sentiment_summary: string;
  risk_flags: string[];
  price_data: PriceData;
  technical_data: TechnicalData;
  news_data: NewsData;
  generated_at: string;
  error?: string;
}
