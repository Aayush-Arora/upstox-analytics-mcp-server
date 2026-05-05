import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_OPTION_CHAIN_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getOptionChainSchema = {
    instrument_key: z.string().describe("Key of an underlying symbol e.g. NSE_INDEX|Nifty 50"),
    expiry_date: z.string().describe("Expiry date in YYYY-MM-DD format"),
};

const GetOptionChainArgsSchema = z.object(getOptionChainSchema);

type GetOptionChainArgs = z.infer<typeof GetOptionChainArgsSchema>;

interface OptionMarketData {
    ltp: number;
    volume: number;
    oi: number;
    close_price: number;
    bid_price: number;
    bid_qty: number;
    ask_price: number;
    ask_qty: number;
    prev_oi: number;
}

interface OptionGreeks {
    vega: number;
    theta: number;
    gamma: number;
    delta: number;
    iv: number;
    pop: number;
}

interface OptionData {
    instrument_key: string;
    market_data: OptionMarketData;
    option_greeks: OptionGreeks;
}

interface UpstoxOptionChainItem {
    expiry: string;
    pcr: number;
    strike_price: number;
    underlying_key: string;
    underlying_spot_price: number;
    call_options: OptionData;
    put_options: OptionData;
}

interface UpstoxOptionChainResponse {
    status: string;
    data: UpstoxOptionChainItem[];
}

export const getOptionChainHandler: ToolHandler<GetOptionChainArgs> = async (
    args: GetOptionChainArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetOptionChainArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_OPTION_CHAIN_ENDPOINT}`);
    url.searchParams.append("instrument_key", validatedArgs.instrument_key);
    url.searchParams.append("expiry_date", validatedArgs.expiry_date);

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

    const data = await response.json() as UpstoxOptionChainResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
