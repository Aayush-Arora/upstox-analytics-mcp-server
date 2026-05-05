import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_INSTRUMENTS_SEARCH_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const searchInstrumentsSchema = {
    query: z.string().describe("Free text search, max 50 chars (e.g. 'SILVER', 'NIFTY', 'RELIANCE')"),
    exchanges: z.string().optional().describe("Comma-separated exchanges: ALL, NSE, BSE, MCX (default: ALL)"),
    segments: z.string().optional().describe("Comma-separated segments: EQ, FO, CURR, COMM, INDEX, OPT, FUT (default: ALL)"),
    instrument_types: z.string().optional().describe("Comma-separated instrument types: CE, PE, FUT, EQ, etc."),
    expiry: z.string().optional().describe("Expiry filter: keyword or YYYY-MM-DD format"),
    page_number: z.number().optional().default(1).describe("Page number, starts at 1"),
    records: z.number().optional().default(30).describe("Results per page, max 30"),
};

const SearchInstrumentsArgsSchema = z.object(searchInstrumentsSchema);

type SearchInstrumentsArgs = z.infer<typeof SearchInstrumentsArgsSchema>;

interface UpstoxSearchResponse {
    status: string;
    data: unknown[];
    meta_data?: {
        page?: {
            page_number: number;
            total_pages: number;
            records: number;
            total_records: number;
        };
    };
}

export const searchInstrumentsHandler: ToolHandler<SearchInstrumentsArgs> = async (
    args: SearchInstrumentsArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = SearchInstrumentsArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_INSTRUMENTS_SEARCH_ENDPOINT}`);
    url.searchParams.append("query", validatedArgs.query);
    if (validatedArgs.exchanges) url.searchParams.append("exchanges", validatedArgs.exchanges);
    if (validatedArgs.segments) url.searchParams.append("segments", validatedArgs.segments);
    if (validatedArgs.instrument_types) url.searchParams.append("instrument_types", validatedArgs.instrument_types);
    if (validatedArgs.expiry) url.searchParams.append("expiry", validatedArgs.expiry);
    url.searchParams.append("page_number", String(validatedArgs.page_number ?? 1));
    url.searchParams.append("records", String(Math.min(validatedArgs.records ?? 30, 30)));

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Accept": HEADERS.ACCEPT,
            "Authorization": `Bearer ${analyticsToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(ERROR_MESSAGES.API_ERROR);
    }

    const data = await response.json() as UpstoxSearchResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
