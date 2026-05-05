import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOptionChainHandler } from '../src/tools/get-option-chain';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-option-chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch option chain successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: [
          {
            expiry: '2025-03-27',
            pcr: 1.2,
            strike_price: 21000,
            underlying_key: 'NSE_INDEX|Nifty 50',
            underlying_spot_price: 21100,
            call_options: {
              instrument_key: 'NSE_FO|12345',
              market_data: { ltp: 250, volume: 100000, oi: 50000, close_price: 245, bid_price: 249, bid_qty: 75, ask_price: 251, ask_qty: 75, prev_oi: 48000 },
              option_greeks: { vega: 0.12, theta: -0.45, gamma: 0.003, delta: 0.62, iv: 18.5, pop: 0.38 }
            },
            put_options: {
              instrument_key: 'NSE_FO|12346',
              market_data: { ltp: 180, volume: 80000, oi: 60000, close_price: 185, bid_price: 179, bid_qty: 75, ask_price: 181, ask_qty: 75, prev_oi: 58000 },
              option_greeks: { vega: 0.11, theta: -0.42, gamma: 0.003, delta: -0.38, iv: 17.8, pop: 0.62 }
            }
          }
        ]
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getOptionChainHandler(
      { instrument_key: 'NSE_INDEX|Nifty 50', expiry_date: '2025-03-27' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
    expect(parsed.data).toBeInstanceOf(Array);
    expect(parsed.data[0]).toHaveProperty('call_options');
    expect(parsed.data[0]).toHaveProperty('put_options');
    expect(parsed.data[0].call_options).toHaveProperty('option_greeks');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getOptionChainHandler(
      { instrument_key: 'NSE_INDEX|Nifty 50', expiry_date: '2025-03-27' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });

  it('should throw on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    await expect(
      getOptionChainHandler(
        { instrument_key: 'NSE_INDEX|Nifty 50', expiry_date: '2025-03-27' },
        { env: mockEnv }
      )
    ).rejects.toThrow('Error occurred while calling Upstox API');
  });
});
