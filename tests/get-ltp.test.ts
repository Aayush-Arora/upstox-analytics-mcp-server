import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLtpHandler } from '../src/tools/get-ltp';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-ltp (v2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch LTP successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          'NSE_EQ|INE848E01016': {
            last_price: 52.05,
            instrument_token: 'NSE_EQ|INE848E01016'
          }
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getLtpHandler(
      { instrument_key: 'NSE_EQ|INE848E01016' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
    expect(parsed.data['NSE_EQ|INE848E01016'].last_price).toBe(52.05);
  });

  it('should return error when analytics token missing', async () => {
    const response = await getLtpHandler(
      { instrument_key: 'NSE_EQ|INE848E01016' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
