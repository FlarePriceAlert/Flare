import { describe, it, expect } from "vitest";
import { checkAlerts, createAlert } from "../src/triggers/checker.js";
import type { TokenPrice } from "../src/lib/types.js";

const SOL_MINT = "So11111111111111111111111111111111111111112";

function makePrice(overrides: Partial<TokenPrice> = {}): TokenPrice {
  return { mint: SOL_MINT, symbol: "SOL", priceUsd: 180, change1h: 1.2, change24h: 3.5, volume24h: 1_200_000, updatedAt: Date.now(), ...overrides };
}

describe("checkAlerts", () => {
  it("triggers price_above alert when price exceeds threshold", () => {
    const alert = createAlert("SOL", SOL_MINT, "price_above", 175);
    const triggers = checkAlerts([alert], [makePrice({ priceUsd: 182 })]);
    expect(triggers).toHaveLength(1);
    expect(triggers[0].token).toBe("SOL");
    expect(alert.status).toBe("triggered");
  });

  it("does not trigger price_above when below threshold", () => {
    const alert = createAlert("SOL", SOL_MINT, "price_above", 200);
    const triggers = checkAlerts([alert], [makePrice({ priceUsd: 180 })]);
    expect(triggers).toHaveLength(0);
    expect(alert.status).toBe("active");
  });

  it("triggers price_below alert", () => {
    const alert = createAlert("SOL", SOL_MINT, "price_below", 185);
    const triggers = checkAlerts([alert], [makePrice({ priceUsd: 180 })]);
    expect(triggers).toHaveLength(1);
  });

  it("triggers pct_change_down alert", () => {
    const alert = createAlert("SOL", SOL_MINT, "pct_change_down", 5);
    const triggers = checkAlerts([alert], [makePrice({ change24h: -8 })]);
    expect(triggers).toHaveLength(1);
  });

  it("reports pct_change_down distance as threshold breach size", () => {
    const alert = createAlert("SOL", SOL_MINT, "pct_change_down", 5);
    const [trigger] = checkAlerts([alert], [makePrice({ change24h: -8 })]);
    expect(trigger?.pctFromThreshold).toBe(3);
  });

  it("reports volatility distance from one-hour absolute move", () => {
    const alert = createAlert("SOL", SOL_MINT, "volatility_spike", 4);
    const [trigger] = checkAlerts([alert], [makePrice({ change1h: -6, change24h: 1 })]);
    expect(trigger?.pctFromThreshold).toBe(2);
  });

  it("does not trigger expired alerts", () => {
    const alert = createAlert("SOL", SOL_MINT, "price_above", 100, undefined, -1000);
    const triggers = checkAlerts([alert], [makePrice({ priceUsd: 180 })]);
    expect(triggers).toHaveLength(0);
    expect(alert.status).toBe("expired");
  });

  it("skips already-triggered alerts", () => {
    const alert = createAlert("SOL", SOL_MINT, "price_above", 100);
    alert.status = "triggered";
    const triggers = checkAlerts([alert], [makePrice({ priceUsd: 180 })]);
    expect(triggers).toHaveLength(0);
  });
});
