import Anthropic from "@anthropic-ai/sdk";
import type { PriceAlert, AlertTrigger } from "../lib/types.js";
import type { Config } from "../lib/config.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { fetchTokenPrices, TRACKED_TOKEN_LIST } from "../monitors/prices.js";
import { checkAlerts, createAlert } from "../triggers/checker.js";
import { printTrigger, printAlertList } from "../alerts/printer.js";
import { logger } from "../lib/logger.js";

const DEFAULT_ALERTS: Omit<Parameters<typeof createAlert>, never>[] = [];

function seedDefaultAlerts(): PriceAlert[] {
  return [
    createAlert("SOL",  "So11111111111111111111111111111111111111112",  "price_above", 200),
    createAlert("SOL",  "So11111111111111111111111111111111111111112",  "price_below", 150),
    createAlert("SOL",  "So11111111111111111111111111111111111111112",  "pct_change_down", 10),
    createAlert("JUP",  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", "price_above", 2),
    createAlert("BONK", "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", "pct_change_up", 25),
    createAlert("WIF",  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", "pct_change_up", 30),
  ];
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "fetch_prices",
    description: "Get current prices for all tracked Solana tokens.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "check_alerts",
    description: "Evaluate all active alerts against current prices and return triggered ones.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "analyze_trigger",
    description: "Deep-dive on a specific alert trigger — price context, volume, likely cause.",
    input_schema: {
      type: "object" as const,
      properties: {
        alert_id: { type: "string" },
        token: { type: "string" },
        current_price: { type: "number" },
      },
      required: ["alert_id", "token"],
    },
  },
  {
    name: "list_alerts",
    description: "List all currently active alerts.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
];

export async function runAgentLoop(config: Config, alerts: PriceAlert[]): Promise<void> {
  const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

  const prices = await fetchTokenPrices(config.COINGECKO_API_URL);
  const triggers = checkAlerts(alerts, prices);

  if (triggers.length > 0) {
    for (const t of triggers) printTrigger(t);
  }

  if (triggers.length === 0) {
    logger.debug("No alerts triggered this cycle");
    return;
  }

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserPrompt(triggers) },
  ];

  let iterations = 0;
  while (iterations < 6) {
    iterations++;
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 3000,
      system: buildSystemPrompt(),
      tools: TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      if (text) console.log("\n" + text);
      break;
    }

    if (response.stop_reason !== "tool_use") break;
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      let result: string;

      if (block.name === "fetch_prices") {
        const fresh = await fetchTokenPrices(config.COINGECKO_API_URL);
        prices.length = 0; prices.push(...fresh);
        result = JSON.stringify(fresh);
      } else if (block.name === "check_alerts") {
        const newTriggers = checkAlerts(alerts, prices);
        result = JSON.stringify(newTriggers);
      } else if (block.name === "analyze_trigger") {
        const input = block.input as { alert_id: string; token: string; current_price?: number };
        const price = prices.find((p) => p.symbol === input.token);
        result = JSON.stringify({
          token: input.token,
          current_price: price?.priceUsd ?? input.current_price ?? 0,
          change_1h: price?.change1h ?? 0,
          change_24h: price?.change24h ?? 0,
          volume_24h: price?.volume24h ?? 0,
        });
      } else if (block.name === "list_alerts") {
        printAlertList(alerts);
        result = JSON.stringify(alerts.filter((a) => a.status === "active"));
      } else {
        result = JSON.stringify({ error: `Unknown tool: ${block.name}` });
      }

      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
    }

    messages.push({ role: "user", content: toolResults });
  }
}

export { seedDefaultAlerts };
