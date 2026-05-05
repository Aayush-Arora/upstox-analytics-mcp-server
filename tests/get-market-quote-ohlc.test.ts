import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMarketQuoteOhlcHandler } from '../src/tools/get-market-quote-ohlc';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-market-quote-ohlc (v2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch OHLC quote successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          'NSE_EQ:NHPC': {
            ohlc: { open: 53.4, high: 53.8, low: 51.75, close: 52.05 },
            last_price: 52.05,
            instrument_token: 'NSE_EQ|INE848E01016'
          }
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getMarketQuoteOhlcHandler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1d' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getMarketQuoteOhlcHandler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1d' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
