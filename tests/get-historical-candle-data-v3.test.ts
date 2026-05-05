import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHistoricalCandleDataV3Handler } from '../src/tools/get-historical-candle-data-v3';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-historical-candle-data-v3', () => {
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
            ['2025-01-01T00:00:00+05:30', 53.1, 53.95, 51.6, 52.05, 235519861, 0]
          ]
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getHistoricalCandleDataV3Handler(
      { instrument_key: 'NSE_EQ|INE848E01016', unit: 'days', interval: '1', to_date: '2025-01-02', from_date: '2025-01-01' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    expect(response.content[0]).toHaveProperty('type', 'text');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
    expect(parsed.data.candles).toBeInstanceOf(Array);
  });

  it('should return error when analytics token missing', async () => {
    const response = await getHistoricalCandleDataV3Handler(
      { instrument_key: 'NSE_EQ|INE848E01016', unit: 'days', interval: '1', to_date: '2025-01-02' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });

  it('should throw on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    await expect(
      getHistoricalCandleDataV3Handler(
        { instrument_key: 'NSE_EQ|INE848E01016', unit: 'days', interval: '1', to_date: '2025-01-02' },
        { env: mockEnv }
      )
    ).rejects.toThrow('Error occurred while calling Upstox API');
  });
});
