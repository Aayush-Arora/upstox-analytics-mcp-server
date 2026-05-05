import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_MARKET_QUOTE_OHLC_V3_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getMarketQuoteOhlcV3Schema = {
    instrument_key: z.string().describe("Comma separated list of instrument keys, max 500"),
    interval: z.enum(["1d", "I1", "I30"]).describe("Interval: 1d=daily, I1=1-minute, I30=30-minute"),
};

const GetMarketQuoteOhlcV3ArgsSchema = z.object(getMarketQuoteOhlcV3Schema);

type GetMarketQuoteOhlcV3Args = z.infer<typeof GetMarketQuoteOhlcV3ArgsSchema>;

interface UpstoxMarketQuoteOhlcV3Response {
    status: string;
    data: {
        [instrument_key: string]: {
            last_price: number;
            instrument_token: string;
            prev_ohlc: { open: number; high: number; low: number; close: number; volume: number; ts: number };
            live_ohlc: { open: number; high: number; low: number; close: number; volume: number; ts: number };
        };
    };
}

export const getMarketQuoteOhlcV3Handler: ToolHandler<GetMarketQuoteOhlcV3Args> = async (
    args: GetMarketQuoteOhlcV3Args,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetMarketQuoteOhlcV3ArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_MARKET_QUOTE_OHLC_V3_ENDPOINT}`);
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

    const data = await response.json() as UpstoxMarketQuoteOhlcV3Response;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
