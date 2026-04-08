import type { TokenPrice } from "../lib/types.js";
import { logger } from "../lib/logger.js";
import { loadConfig } from "../lib/config.js";

const TRACKED_TOKENS = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112", coingeckoId: "solana" },
  { symbol: "JUP", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", coingeckoId: "jupiter-exchange-solana" },
  { symbol: "JTO", mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", coingeckoId: "jito-governance-token" },
  { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", coingeckoId: "bonk" },
  { symbol: "WIF", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", coingeckoId: "dogwifcoin" },
  { symbol: "PYTH", mint: "HZ1JovNiVvGrGs4KXyWoZBgbVhDSPNJuxA4F4kqd12gB", coingeckoId: "pyth-network" },
];

interface CoinGeckoMarket {
  id: string;
  current_price: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h?: number;
  total_volume?: number;
  last_updated?: string;
}

export async function fetchTokenPrices(apiUrl = loadConfig().COINGECKO_API_URL): Promise<TokenPrice[]> {
  try {
    const ids = TRACKED_TOKENS.map((token) => token.coingeckoId).join(",");
    const url =
      `${apiUrl}/coins/markets` +
      `?vs_currency=usd` +
      `&ids=${ids}` +
      `&price_change_percentage=1h,24h`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      logger.warn(`CoinGecko markets returned ${res.status}`);
      return [];
    }

    const data = await res.json() as CoinGeckoMarket[];
    const byId = new Map(data.map((item) => [item.id, item]));

    return TRACKED_TOKENS.map((token) => {
      const market = byId.get(token.coingeckoId);
      return {
        mint: token.mint,
        symbol: token.symbol,
        priceUsd: market?.current_price ?? 0,
        change1h: market?.price_change_percentage_1h_in_currency ?? 0,
        change24h: market?.price_change_percentage_24h ?? 0,
        volume24h: market?.total_volume ?? 0,
        updatedAt: market?.last_updated ? Date.parse(market.last_updated) : Date.now(),
      };
    });
  } catch (err) {
    logger.debug("Failed to fetch token prices:", err);
    return [];
  }
}

export const TRACKED_TOKEN_LIST = TRACKED_TOKENS;
