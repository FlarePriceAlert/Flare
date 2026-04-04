import type { TokenPrice } from "../lib/types.js";
import { logger } from "../lib/logger.js";

const TRACKED_TOKENS = [
  { symbol: "SOL",  mint: "So11111111111111111111111111111111111111112" },
  { symbol: "JUP",  mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  { symbol: "JTO",  mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL" },
  { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { symbol: "WIF",  mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  { symbol: "PYTH", mint: "HZ1JovNiVvGrGs4KXyWoZBgbVhDSPNJuxA4F4kqd12gB" },
];

interface BirdeyeResponse {
  data: {
    value: number;
    updateUnixTime: number;
  };
  success: boolean;
}

export async function fetchTokenPrices(birdeyeApiKey: string): Promise<TokenPrice[]> {
  const results: TokenPrice[] = [];

  for (const token of TRACKED_TOKENS) {
    try {
      const url = `https://public-api.birdeye.so/defi/price?address=${token.mint}`;
      const res = await fetch(url, {
        headers: birdeyeApiKey ? { "X-API-KEY": birdeyeApiKey } : {},
      });

      if (!res.ok) {
        results.push({
          mint: token.mint,
          symbol: token.symbol,
          priceUsd: 0,
          change1h: 0,
          change24h: 0,
          volume24h: 0,
          updatedAt: Date.now(),
        });
        continue;
      }

      const data = (await res.json()) as BirdeyeResponse;
      results.push({
        mint: token.mint,
        symbol: token.symbol,
        priceUsd: data.data?.value ?? 0,
        change1h: 0,
        change24h: 0,
        volume24h: 0,
        updatedAt: data.data?.updateUnixTime ? data.data.updateUnixTime * 1000 : Date.now(),
      });
    } catch (err) {
      logger.debug(`Failed to fetch price for ${token.symbol}:`, err);
    }
  }

  return results;
}

export const TRACKED_TOKEN_LIST = TRACKED_TOKENS;
