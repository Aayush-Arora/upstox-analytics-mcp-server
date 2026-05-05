import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFullMarketQuoteHandler } from '../src/tools/get-full-market-quote';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-full-market-quote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch full market quote successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          'NSE_EQ|INE848E01016': {
            ohlc: { open: 53.4, high: 53.8, low: 51.75, close: 52.05 },
            depth: { buy: [], sell: [] },
            timestamp: '2025-01-01T10:00:00+05:30',
            instrument_token: 'NSE_EQ|INE848E01016',
            symbol: 'NHPC',
            last_price: 52.05,
            volume: 1000000,
            average_price: 52.0,
            oi: 0,
            net_change: -0.35,
            total_buy_quantity: 5000,
            total_sell_quantity: 3000,
            lower_circuit_limit: 46.85,
            upper_circuit_limit: 57.25,
            last_trade_time: '2025-01-01T09:59:00+05:30',
            oi_day_high: 0,
            oi_day_low: 0
          }
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getFullMarketQuoteHandler(
      { instrument_key: 'NSE_EQ|INE848E01016' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
    expect(parsed.data).toHaveProperty('NSE_EQ|INE848E01016');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getFullMarketQuoteHandler(
      { instrument_key: 'NSE_EQ|INE848E01016' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
