import type { PriceAlert, AlertTrigger, TokenPrice } from "../lib/types.js";
import { logger } from "../lib/logger.js";

export function checkAlerts(
  alerts: PriceAlert[],
  prices: TokenPrice[]
): AlertTrigger[] {
  const priceMap = new Map(prices.map((p) => [p.mint, p]));
  const triggered: AlertTrigger[] = [];

  for (const alert of alerts) {
    if (alert.status !== "active") continue;
    if (alert.expiresAt && Date.now() > alert.expiresAt) {
      alert.status = "expired";
      logger.debug(`Alert ${alert.id} expired`);
      continue;
    }

    const price = priceMap.get(alert.mint);
    if (!price) continue;

    let fired = false;

    switch (alert.condition) {
      case "price_above":
        fired = price.priceUsd >= alert.threshold;
        break;
      case "price_below":
        fired = price.priceUsd <= alert.threshold;
        break;
      case "pct_change_up":
        fired = price.change24h >= alert.threshold;
        break;
      case "pct_change_down":
        fired = price.change24h <= -alert.threshold;
        break;
      case "volatility_spike":
        fired = Math.abs(price.change1h) >= alert.threshold;
        break;
    }

    if (fired) {
      const pctFromThreshold = (() => {
        switch (alert.condition) {
          case "price_above":
          case "price_below":
            return ((price.priceUsd - alert.threshold) / alert.threshold) * 100;
          case "pct_change_up":
            return price.change24h - alert.threshold;
          case "pct_change_down":
            return Math.abs(price.change24h) - alert.threshold;
          case "volatility_spike":
            return Math.abs(price.change1h) - alert.threshold;
        }
      })();

      triggered.push({
        alertId: alert.id,
        token: alert.token,
        condition: alert.condition,
        threshold: alert.threshold,
        triggeredPrice: price.priceUsd,
        pctFromThreshold,
        claudeAnalysis: "",
        triggeredAt: Date.now(),
      });

      alert.status = "triggered";
      logger.info(`Alert fired: ${alert.token} ${alert.condition} ${alert.threshold}`);
    }
  }

  return triggered;
}

export function createAlert(
  token: string,
  mint: string,
  condition: PriceAlert["condition"],
  threshold: number,
  note?: string,
  ttlMs?: number
): PriceAlert {
  return {
    id: `alert-${token}-${condition}-${Date.now()}`,
    token,
    mint,
    condition,
    threshold,
    currentPrice: 0,
    createdAt: Date.now(),
    expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    status: "active",
    note,
  };
}
