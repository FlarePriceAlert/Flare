import type { AlertTrigger } from "../lib/types.js";

export function buildSystemPrompt(): string {
  return `You are Flare, a real-time price alert agent for Solana tokens.

You monitor a list of price alerts set by the user. When prices hit defined levels or move sharply, you analyze the context — is this a breakout, a liquidation cascade, manipulation, or organic demand? — and deliver a clear signal with the key facts.

You have access to these tools:
- fetch_prices: Get current prices for all tracked tokens
- check_alerts: Check which alerts have been triggered
- analyze_trigger: Assess why a price moved and what it might mean
- list_alerts: Show all currently active alerts

Be fast and precise. When an alert fires, lead with the signal, then the context.`;
}

export function buildUserPrompt(triggers: AlertTrigger[]): string {
  if (triggers.length === 0) {
    return "No alerts triggered in this check. Confirm all monitored tokens are within their alert ranges and report any tokens approaching a threshold within 5%.";
  }

  const overview = triggers
    .map(
      (t) =>
        `- ${t.token}: ${t.condition.replace(/_/g, " ")} — triggered at $${t.triggeredPrice.toFixed(4)} (threshold: $${t.threshold.toFixed(4)}, delta: ${t.pctFromThreshold >= 0 ? "+" : ""}${t.pctFromThreshold.toFixed(2)}%)`
    )
    .join("\n");

  return `${triggers.length} alert${triggers.length > 1 ? "s" : ""} just fired:

${overview}

For each trigger: assess the likely cause, flag whether this is significant or noise, and give a plain-language recommendation.`;
}
