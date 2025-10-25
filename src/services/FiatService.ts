/**
 * Fiat conversion service
 * Provides EUR/USD conversion rates for cryptocurrencies
 */

import { ChainType } from '../types/wallet';

interface PriceData {
  EUR: number;
  USD: number;
}

interface PriceCache {
  [key: string]: {
    prices: PriceData;
    timestamp: number;
  };
}

export class FiatService {
  private static cache: PriceCache = {};
  private static CACHE_DURATION = 60000; // 1 minute

  /**
   * Get mock price data for a chain
   * In production, this would fetch from a real API
   */
  private static getMockPrices(chain: ChainType): PriceData {
    const mockPrices: { [key in ChainType]: PriceData } = {
      EVM: { EUR: 2800, USD: 3000 }, // ETH
      Solana: { EUR: 140, USD: 150 }, // SOL
      TON: { EUR: 4.5, USD: 5 }, // TON
      Bitcoin: { EUR: 56000, USD: 60000 }, // BTC
      Litecoin: { EUR: 93, USD: 100 }, // LTC
    };

    return mockPrices[chain];
  }

  /**
   * Get current price for a chain in EUR and USD
   */
  static async getPrice(chain: ChainType): Promise<PriceData> {
    const cached = this.cache[chain];
    const now = Date.now();

    // Return cached price if still valid
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.prices;
    }

    // In production, fetch from real API (CoinGecko, CoinMarketCap, etc.)
    // For now, using mock data
    const prices = this.getMockPrices(chain);

    // Update cache
    this.cache[chain] = {
      prices,
      timestamp: now,
    };

    return prices;
  }

  /**
   * Convert crypto amount to fiat
   */
  static async convertToFiat(
    chain: ChainType,
    amount: number
  ): Promise<PriceData> {
    const prices = await this.getPrice(chain);
    return {
      EUR: amount * prices.EUR,
      USD: amount * prices.USD,
    };
  }

  /**
   * Format fiat amount with currency symbol
   */
  static formatFiat(amount: number, currency: 'EUR' | 'USD'): string {
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
