import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_NEWS_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getNewsSchema = {
    category: z.enum(["instrument_keys", "positions", "holdings"]).describe(
        "News category: 'instrument_keys' for specific instruments, 'positions' for current positions, 'holdings' for holdings"
    ),
    instrument_keys: z.string().optional().describe(
        "Comma-separated list of instrument keys (max 30). Required when category is 'instrument_keys'"
    ),
    page_number: z.number().int().min(1).max(100).optional().default(1).describe(
        "Page number for pagination (1-100, default 1)"
    ),
    page_size: z.number().int().min(1).max(100).optional().default(100).describe(
        "Number of records per page (1-100, default 100)"
    ),
};

const GetNewsArgsSchema = z.object(getNewsSchema);

type GetNewsArgs = z.infer<typeof GetNewsArgsSchema>;

interface NewsArticle {
    heading: string;
    summary: string;
    thumbnail: string;
    article_link: string;
    published_time: number;
}

interface NewsPageMetadata {
    page_number: number;
    page_size: number;
    total_records: number;
    total_pages: number;
}

interface UpstoxNewsResponse {
    status: string;
    data: Record<string, NewsArticle[]>;
    metadata: {
        page: NewsPageMetadata;
    };
}

export const getNewsHandler: ToolHandler<GetNewsArgs> = async (
    args: GetNewsArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetNewsArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_NEWS_ENDPOINT}`);
    url.searchParams.append("category", validatedArgs.category);

    if (validatedArgs.instrument_keys) {
        url.searchParams.append("instrument_keys", validatedArgs.instrument_keys);
    }

    if (validatedArgs.page_number !== undefined) {
        url.searchParams.append("page_number", validatedArgs.page_number.toString());
    }

    if (validatedArgs.page_size !== undefined) {
        url.searchParams.append("page_size", validatedArgs.page_size.toString());
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Accept": HEADERS.ACCEPT,
            "Authorization": `Bearer ${analyticsToken}`
        }
    });

    if (!response.ok) {
        throw new Error(ERROR_MESSAGES.API_ERROR);
    }

    const data = await response.json() as UpstoxNewsResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
