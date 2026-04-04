type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
let current: Level = "info";
export function setLogLevel(l: Level) { current = l; }
function log(level: Level, ...args: unknown[]) {
  if (ORDER[level] < ORDER[current]) return;
  const ts = new Date().toISOString();
  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(`[${ts}] [${level.toUpperCase()}]`, ...args);
}
export const logger = {
  debug: (...a: unknown[]) => log("debug", ...a),
  info: (...a: unknown[]) => log("info", ...a),
  warn: (...a: unknown[]) => log("warn", ...a),
  error: (...a: unknown[]) => log("error", ...a),
};
