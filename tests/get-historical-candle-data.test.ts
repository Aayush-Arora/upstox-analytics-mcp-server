import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHistoricalCandleDataHandler } from '../src/tools/get-historical-candle-data';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-historical-candle-data (v2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch historical candle data successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          candles: [
            ['2023-10-01T00:00:00+05:30', 53.1, 53.95, 51.6, 52.05, 235519861, 0]
          ]
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getHistoricalCandleDataHandler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1minute', to_date: '2023-11-13', from_date: '2023-11-12' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getHistoricalCandleDataHandler(
      { instrument_key: 'NSE_EQ|INE848E01016', interval: '1minute', to_date: '2023-11-13' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
