import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getIntradayCandleDataHandler } from '../src/tools/get-intraday-candle-data';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-intraday-candle-data (v2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch intraday candle data successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          candles: [
            ['2023-10-19T15:15:00+05:30', 2305.3, 2307.05, 2301, 2304.65, 559982, 0]
          ]
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getIntradayCandleDataHandler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1minute' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getIntradayCandleDataHandler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1minute' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
