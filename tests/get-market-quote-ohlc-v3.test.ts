import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMarketQuoteOhlcV3Handler } from '../src/tools/get-market-quote-ohlc-v3';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-market-quote-ohlc-v3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch OHLC V3 quote successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          'NSE_EQ|INE848E01016': {
            last_price: 52.05,
            instrument_token: 'NSE_EQ|INE848E01016',
            prev_ohlc: { open: 53.4, high: 53.8, low: 51.75, close: 52.05, volume: 1000000, ts: 1700000000 },
            live_ohlc: { open: 52.1, high: 52.5, low: 51.9, close: 52.05, volume: 500000, ts: 1700000100 }
          }
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getMarketQuoteOhlcV3Handler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1d' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getMarketQuoteOhlcV3Handler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1d' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
