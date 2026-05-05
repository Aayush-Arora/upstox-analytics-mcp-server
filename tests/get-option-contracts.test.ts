import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOptionContractsHandler } from '../src/tools/get-option-contracts';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

describe('get-option-contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch option contracts successfully', async () => {
    const mockApiResponse = {
      ok: true,
      json: async () => ({
        status: 'success',
        data: [
          {
            name: 'NIFTY',
            segment: 'NSE_FO',
            exchange: 'NSE',
            expiry: '2025-03-27',
            instrument_key: 'NSE_FO|12345',
            exchange_token: '12345',
            trading_symbol: 'NIFTY25MAR21000CE',
            tick_size: 0.05,
            lot_size: 75,
            instrument_type: 'CE',
            freeze_quantity: 1800,
            underlying_key: 'NSE_INDEX|Nifty 50',
            underlying_type: 'INDEX',
            underlying_symbol: 'Nifty 50',
            strike_price: 21000,
            minimum_lot: 75,
            weekly: false
          }
        ]
      })
    };
    mockFetch.mockResolvedValueOnce(mockApiResponse);

    const response = await getOptionContractsHandler(
      { instrument_key: 'NSE_INDEX|Nifty 50', expiry_date: '2025-03-27' },
      { env: mockEnv }
    );

    expect(response).toHaveProperty('content');
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.status).toBe('success');
    expect(parsed.data).toBeInstanceOf(Array);
    expect(parsed.data[0]).toHaveProperty('instrument_type');
    expect(parsed.data[0]).toHaveProperty('strike_price');
  });

  it('should return error when analytics token missing', async () => {
    const response = await getOptionContractsHandler(
      { instrument_key: 'NSE_INDEX|Nifty 50' },
      { env: {} }
    );

    expect(response.isError).toBe(true);
  });
});
