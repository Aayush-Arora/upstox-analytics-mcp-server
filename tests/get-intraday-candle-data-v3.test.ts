import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getIntradayCandleDataV3Handler } from '../src/tools/get-intraday-candle-data-v3';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-intraday-candle-data-v3', () => {
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
            ['2025-01-12T15:15:00+05:30', 2305.3, 2307.05, 2301, 2304.65, 559982, 0]
          ]
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getIntradayCandleDataV3Handler(
      { instrument_key: 'NSE_EQ|INE848E01016', unit: 'minutes', interval: '1' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
    expect(parsed.data.candles).toBeInstanceOf(Array);
  });

  it('should return error when analytics token missing', async () => {
    const response = await getIntradayCandleDataV3Handler(
      { instrument_key: 'NSE_EQ|INE848E01016', unit: 'minutes', interval: '1' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
