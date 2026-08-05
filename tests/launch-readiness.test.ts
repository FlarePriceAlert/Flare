import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { description?: string; homepage?: string; keywords?: string[] };

describe("Solana launch presentation", () => {
  it("positions Flare for Solana and Pump.fun", () => {
    expect(readme).toContain("alert board for Solana token price moves");
    expect(readme).toContain("[Website](https://flaremoves.com/)");
    expect(readme).toContain("[Launch venue](https://pump.fun/)");
    expect(packageJson.description).toContain("Solana token");
    expect(packageJson.homepage).toBe("https://flaremoves.com/");
    expect(packageJson.keywords).toContain("solana");
    expect(packageJson.keywords).toContain("pumpfun");
  });
});
