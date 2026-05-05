import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_FULL_MARKET_QUOTE_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getFullMarketQuoteSchema = {
    instrument_key: z.string().describe("Comma separated list of instrument keys, max 500"),
};

const GetFullMarketQuoteArgsSchema = z.object(getFullMarketQuoteSchema);

type GetFullMarketQuoteArgs = z.infer<typeof GetFullMarketQuoteArgsSchema>;

interface UpstoxFullMarketQuoteResponse {
    status: string;
    data: {
        [instrument_key: string]: {
            ohlc: { open: number; high: number; low: number; close: number };
            depth: {
                buy: Array<{ quantity: number; price: number; orders: number }>;
                sell: Array<{ quantity: number; price: number; orders: number }>;
            };
            timestamp: string;
            instrument_token: string;
            symbol: string;
            last_price: number;
            volume: number;
            average_price: number;
            oi: number;
            net_change: number;
            total_buy_quantity: number;
            total_sell_quantity: number;
            lower_circuit_limit: number;
            upper_circuit_limit: number;
            last_trade_time: string;
            oi_day_high: number;
            oi_day_low: number;
        };
    };
}

export const getFullMarketQuoteHandler: ToolHandler<GetFullMarketQuoteArgs> = async (
    args: GetFullMarketQuoteArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetFullMarketQuoteArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_FULL_MARKET_QUOTE_ENDPOINT}`);
    url.searchParams.append("instrument_key", validatedArgs.instrument_key);

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

    const data = await response.json() as UpstoxFullMarketQuoteResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
