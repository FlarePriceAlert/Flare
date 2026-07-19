import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { description?: string; homepage?: string; keywords?: string[] };

describe("Robinhood launch presentation", () => {
  it("positions Flare for Robinhood crypto without changing runtime code", () => {
    expect(readme).toContain("alert board for Robinhood crypto price moves");
    expect(readme).toContain("[Website](https://flare-launch.vercel.app/)");
    expect(packageJson.description).toContain("Robinhood crypto");
    expect(packageJson.homepage).toBe("https://flare-launch.vercel.app/");
    expect(packageJson.keywords).toContain("robinhood");
    expect(packageJson.keywords).not.toContain("solana");
    expect(readme).not.toMatch(/\bSolana\b/i);
  });
});
