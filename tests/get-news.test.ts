import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNewsHandler } from '../src/tools/get-news';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEnv = { UPSTOX_ANALYTICS_TOKEN: process.env.UPSTOX_ANALYTICS_TOKEN || 'test_token' };

const mockArticle = {
    heading: 'Reliance Q4 results beat estimates',
    summary: 'Reliance Industries reported strong Q4 earnings.',
    thumbnail: 'https://example.com/thumb.jpg',
    article_link: 'https://example.com/article',
    published_time: 1714000000000,
};

const mockApiResponse = {
    status: 'success',
    data: { 'NSE_EQ|INE002A01018': [mockArticle] },
    metadata: { page: { page_number: 1, page_size: 100, total_records: 1, total_pages: 1 } },
};

describe('get-news', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch news for instrument_keys category', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse });

        const response = await getNewsHandler(
            { category: 'instrument_keys', instrument_keys: 'NSE_EQ|INE002A01018' },
            { env: mockEnv }
        );

        expect(response).toHaveProperty('content');
        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.status).toBe('success');
        expect(parsed.data).toHaveProperty('NSE_EQ|INE002A01018');
        expect(parsed.metadata.page.total_records).toBe(1);
    });

    it('should fetch news for positions category', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockApiResponse, data: {} }) });

        const response = await getNewsHandler(
            { category: 'positions' },
            { env: mockEnv }
        );

        expect(response).toHaveProperty('content');
        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.status).toBe('success');
    });

    it('should fetch news for holdings category', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockApiResponse, data: {} }) });

        const response = await getNewsHandler(
            { category: 'holdings' },
            { env: mockEnv }
        );

        expect(response).toHaveProperty('content');
        const parsed = JSON.parse(response.content[0].text);
        expect(parsed.status).toBe('success');
    });

    it('should throw when instrument_keys missing for instrument_keys category', async () => {
        await expect(
            getNewsHandler(
                { category: 'instrument_keys' } as any,
                { env: mockEnv }
            )
        ).rejects.toThrow("instrument_keys is required when category is 'instrument_keys'");
    });

    it('should throw when instrument_keys exceeds 30 keys', async () => {
        const tooManyKeys = Array.from({ length: 31 }, (_, i) => `NSE_EQ|KEY${i}`).join(',');

        await expect(
            getNewsHandler(
                { category: 'instrument_keys', instrument_keys: tooManyKeys },
                { env: mockEnv }
            )
        ).rejects.toThrow('instrument_keys must contain at most 30 keys');
    });

    it('should return error when analytics token missing', async () => {
        const response = await getNewsHandler(
            { category: 'positions' },
            { env: {} }
        );

        expect(response.isError).toBe(true);
    });

    it('should throw on API error', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

        await expect(
            getNewsHandler(
                { category: 'positions' },
                { env: mockEnv }
            )
        ).rejects.toThrow('Error occurred while calling Upstox API');
    });
});
