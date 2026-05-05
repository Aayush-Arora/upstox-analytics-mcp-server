import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_HISTORICAL_CANDLE_V2_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getHistoricalCandleDataSchema = {
    instrument_key: z.string().describe("Instrument key e.g. NSE_EQ|INE848E01016"),
    interval: z.enum(["1minute", "30minute", "day", "week", "month"]).describe("Candle interval"),
    to_date: z.string().describe("End date inclusive in YYYY-MM-DD format"),
    from_date: z.string().optional().describe("Start date in YYYY-MM-DD format (optional)"),
};

const GetHistoricalCandleDataArgsSchema = z.object(getHistoricalCandleDataSchema);

type GetHistoricalCandleDataArgs = z.infer<typeof GetHistoricalCandleDataArgsSchema>;

interface UpstoxHistoricalCandleResponse {
    status: string;
    data: {
        candles: Array<[string, number, number, number, number, number, number]>;
    };
}

export const getHistoricalCandleDataHandler: ToolHandler<GetHistoricalCandleDataArgs> = async (
    args: GetHistoricalCandleDataArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetHistoricalCandleDataArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const encodedKey = encodeURIComponent(validatedArgs.instrument_key);
    let path = `${UPSTOX_API_HISTORICAL_CANDLE_V2_ENDPOINT}/${encodedKey}/${validatedArgs.interval}/${validatedArgs.to_date}`;
    if (validatedArgs.from_date) {
        path += `/${validatedArgs.from_date}`;
    }

    const response = await fetch(`${UPSTOX_API_BASE_URL}${path}`, {
        method: "GET",
        headers: {
            "Accept": HEADERS.ACCEPT,
            "Authorization": `Bearer ${analyticsToken}`
        }
    });

    if (!response.ok) {
        throw new Error(ERROR_MESSAGES.API_ERROR);
    }

    const data = await response.json() as UpstoxHistoricalCandleResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
