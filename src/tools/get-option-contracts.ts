import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_OPTION_CONTRACTS_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getOptionContractsSchema = {
    instrument_key: z.string().describe("Key of an underlying symbol e.g. NSE_INDEX|Nifty 50"),
    expiry_date: z.string().optional().describe("Filter by expiry date in YYYY-MM-DD format (optional)"),
};

const GetOptionContractsArgsSchema = z.object(getOptionContractsSchema);

type GetOptionContractsArgs = z.infer<typeof GetOptionContractsArgsSchema>;

interface UpstoxOptionContract {
    name: string;
    segment: string;
    exchange: string;
    expiry: string;
    instrument_key: string;
    exchange_token: string;
    trading_symbol: string;
    tick_size: number;
    lot_size: number;
    instrument_type: string;
    freeze_quantity: number;
    underlying_key: string;
    underlying_type: string;
    underlying_symbol: string;
    strike_price: number;
    minimum_lot: number;
    weekly: boolean;
}

interface UpstoxOptionContractsResponse {
    status: string;
    data: UpstoxOptionContract[];
}

export const getOptionContractsHandler: ToolHandler<GetOptionContractsArgs> = async (
    args: GetOptionContractsArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetOptionContractsArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_OPTION_CONTRACTS_ENDPOINT}`);
    url.searchParams.append("instrument_key", validatedArgs.instrument_key);
    if (validatedArgs.expiry_date) {
        url.searchParams.append("expiry_date", validatedArgs.expiry_date);
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

    const data = await response.json() as UpstoxOptionContractsResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
