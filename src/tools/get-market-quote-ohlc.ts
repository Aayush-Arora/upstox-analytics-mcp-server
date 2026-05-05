import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_MARKET_QUOTE_OHLC_V2_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getMarketQuoteOhlcSchema = {
    instrument_key: z.string().describe("Comma separated list of instrument keys, max 500"),
    interval: z.enum(["1d", "I1", "I30"]).describe("Interval: 1d=daily, I1=1-minute, I30=30-minute"),
};

const GetMarketQuoteOhlcArgsSchema = z.object(getMarketQuoteOhlcSchema);

type GetMarketQuoteOhlcArgs = z.infer<typeof GetMarketQuoteOhlcArgsSchema>;

interface UpstoxMarketQuoteOhlcResponse {
    status: string;
    data: {
        [instrument_key: string]: {
            ohlc: { open: number; high: number; low: number; close: number };
            last_price: number;
            instrument_token: string;
        };
    };
}

export const getMarketQuoteOhlcHandler: ToolHandler<GetMarketQuoteOhlcArgs> = async (
    args: GetMarketQuoteOhlcArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetMarketQuoteOhlcArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_MARKET_QUOTE_OHLC_V2_ENDPOINT}`);
    url.searchParams.append("instrument_key", validatedArgs.instrument_key);
    url.searchParams.append("interval", validatedArgs.interval);

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

    const data = await response.json() as UpstoxMarketQuoteOhlcResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
