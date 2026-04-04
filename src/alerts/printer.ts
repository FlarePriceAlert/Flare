import type { AlertTrigger, PriceAlert } from "../lib/types.js";

function conditionLabel(c: PriceAlert["condition"]): string {
  const map: Record<PriceAlert["condition"], string> = {
    price_above: "PRICE ABOVE",
    price_below: "PRICE BELOW",
    pct_change_up: "% SURGE",
    pct_change_down: "% DROP",
    volatility_spike: "VOLATILITY SPIKE",
  };
  return map[c];
}

export function printTrigger(trigger: AlertTrigger): void {
  const ts = new Date(trigger.triggeredAt).toLocaleTimeString("en-US", { hour12: false });
  console.log(`\n${"▓".repeat(58)}`);
  console.log(`  FLARE  [${ts}]`);
  console.log(`  TOKEN   ${trigger.token}`);
  console.log(`  EVENT   ${conditionLabel(trigger.condition)}`);
  console.log(`  TARGET  $${trigger.threshold.toFixed(trigger.condition.startsWith("pct") ? 1 : 4)}`);
  console.log(`  PRICE   $${trigger.triggeredPrice.toFixed(4)}`);
  console.log(`  DELTA   ${trigger.pctFromThreshold >= 0 ? "+" : ""}${trigger.pctFromThreshold.toFixed(2)}%`);
  if (trigger.claudeAnalysis) console.log(`  SIGNAL  ${trigger.claudeAnalysis}`);
  console.log(`${"▓".repeat(58)}\n`);
}

export function printAlertList(alerts: PriceAlert[]): void {
  const active = alerts.filter((a) => a.status === "active");
  console.log(`\n  Watching ${active.length} active alerts\n`);
  for (const a of active) {
    const ttl = a.expiresAt ? ` (expires ${new Date(a.expiresAt).toLocaleDateString()})` : "";
    console.log(`  • ${a.token.padEnd(8)} ${conditionLabel(a.condition).padEnd(20)} ${a.threshold}${ttl}`);
  }
}
