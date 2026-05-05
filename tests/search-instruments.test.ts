import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchInstrumentsHandler } from '../src/tools/search-instruments';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

const mockResponse = {
    status: 'success',
    data: [
        {
            instrument_key: 'MCX_FO|SILVERMIC25MAYFUT',
            trading_symbol: 'SILVERMIC25MAYFUT',
            name: 'SILVERMIC',
            expiry: '2025-05-30',
            instrument_type: 'FUT',
            exchange: 'MCX',
            segment: 'COMM',
        },
        {
            instrument_key: 'MCX_FO|SILVER25MAYFUT',
            trading_symbol: 'SILVER25MAYFUT',
            name: 'SILVER',
            expiry: '2025-05-30',
            instrument_type: 'FUT',
            exchange: 'MCX',
            segment: 'COMM',
        },
    ],
    meta_data: {
        page: { page_number: 1, total_pages: 1, records: 2, total_records: 2 },
    },
};

describe('search-instruments', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should search instruments and return results', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const response = await searchInstrumentsHandler(
            { query: 'SILVER', exchanges: 'MCX', segments: 'COMM' },
            { env: mockEnv }
        );

        expect(response).toHaveProperty('content');
        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.status).toBe('success');
        expect(parsed.data).toHaveLength(2);
    });

    it('should pass query params correctly', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await searchInstrumentsHandler(
            { query: 'SILVER', exchanges: 'MCX', instrument_types: 'FUT', records: 10 },
            { env: mockEnv }
        );

        const calledUrl = mockFetch.mock.calls[0][0] as string;
        expect(calledUrl).toContain('query=SILVER');
        expect(calledUrl).toContain('exchanges=MCX');
        expect(calledUrl).toContain('instrument_types=FUT');
        expect(calledUrl).toContain('records=10');
    });

    it('should cap records at 30', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await searchInstrumentsHandler(
            { query: 'SILVER', records: 100 },
            { env: mockEnv }
        );

        const calledUrl = mockFetch.mock.calls[0][0] as string;
        expect(calledUrl).toContain('records=30');
    });

    it('should return error when token missing', async () => {
        const response = await searchInstrumentsHandler(
            { query: 'SILVER' },
            { env: {} }
        );

        expect(response.isError).toBe(true);
    });
});
