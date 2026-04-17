import { loadConfig } from "./lib/config.js";
import { setLogLevel } from "./lib/logger.js";
import { runAgentLoop, seedDefaultAlerts } from "./agent/loop.js";
import { printAlertList } from "./alerts/printer.js";
import { logger } from "./lib/logger.js";

async function main(): Promise<void> {
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);
  logger.info("Flare starting - price alert agent");

  const alerts = seedDefaultAlerts();
  printAlertList(alerts);

  async function check(): Promise<void> {
    const startedAt = Date.now();

    try {
      await runAgentLoop(config, alerts);
    } catch (err) {
      logger.error("Check error:", err);
    } finally {
      const durationMs = Date.now() - startedAt;
      logger.info("Alert check complete", { durationMs });

      if (durationMs > config.CHECK_INTERVAL_MS) {
        logger.warn("Alert check exceeded configured interval", {
          durationMs,
          intervalMs: config.CHECK_INTERVAL_MS,
        });
      }
    }
  }

  let checkInFlight = false;
  let skippedChecks = 0;

  const tick = async () => {
    if (checkInFlight) {
      skippedChecks++;
      logger.warn("Skipping alert check because the previous cycle is still running", {
        skippedChecks,
      });
      return;
    }

    checkInFlight = true;
    try {
      await check();
    } finally {
      checkInFlight = false;
    }
  };

  await tick();
  setInterval(() => {
    void tick();
  }, config.CHECK_INTERVAL_MS);
  logger.info(`Checking every ${config.CHECK_INTERVAL_MS / 1000}s...`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
