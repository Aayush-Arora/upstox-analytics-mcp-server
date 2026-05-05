import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOptionGreeksHandler } from '../src/tools/get-option-greeks';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-option-greeks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch option greeks successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          'NSE_FO|12345': {
            last_price: 250.5,
            instrument_token: 'NSE_FO|12345',
            ltq: 50,
            volume: 200000,
            cp: 245.0,
            iv: 18.5,
            vega: 0.12,
            gamma: 0.003,
            theta: -0.45,
            delta: 0.62,
            oi: 50000
          }
        }
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getOptionGreeksHandler(
      { instrument_key: 'NSE_FO|12345' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
    expect(parsed.data['NSE_FO|12345']).toHaveProperty('delta');
    expect(parsed.data['NSE_FO|12345']).toHaveProperty('iv');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getOptionGreeksHandler(
      { instrument_key: 'NSE_FO|12345' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
