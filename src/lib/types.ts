export type AlertCondition = "price_above" | "price_below" | "pct_change_up" | "pct_change_down" | "volatility_spike";
export type AlertStatus = "active" | "triggered" | "expired" | "dismissed";

export interface PriceAlert {
  id: string;
  token: string;
  mint: string;
  condition: AlertCondition;
  threshold: number;
  currentPrice: number;
  createdAt: number;
  expiresAt?: number;
  status: AlertStatus;
  note?: string;
}

export interface AlertTrigger {
  alertId: string;
  token: string;
  condition: AlertCondition;
  threshold: number;
  triggeredPrice: number;
  pctFromThreshold: number;
  claudeAnalysis: string;
  triggeredAt: number;
}

export interface TokenPrice {
  mint: string;
  symbol: string;
  priceUsd: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  updatedAt: number;
}
