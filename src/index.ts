import { loadConfig } from "./lib/config.js";
import { setLogLevel } from "./lib/logger.js";
import { runAgentLoop, seedDefaultAlerts } from "./agent/loop.js";
import { printAlertList } from "./alerts/printer.js";
import { logger } from "./lib/logger.js";

async function main(): Promise<void> {
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);
  logger.info("Flare starting — price alert agent");

  const alerts = seedDefaultAlerts();
  printAlertList(alerts);

  async function check(): Promise<void> {
    try { await runAgentLoop(config, alerts); } catch (err) { logger.error("Check error:", err); }
  }

  await check();
  setInterval(check, config.CHECK_INTERVAL_MS);
  logger.info(`Checking every ${config.CHECK_INTERVAL_MS / 1000}s...`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
