import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_HISTORICAL_CANDLE_V2_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getIntradayCandleDataSchema = {
    instrument_key: z.string().describe("Instrument key e.g. NSE_EQ|INE848E01016"),
    interval: z.enum(["1minute", "30minute"]).describe("Candle interval"),
};

const GetIntradayCandleDataArgsSchema = z.object(getIntradayCandleDataSchema);

type GetIntradayCandleDataArgs = z.infer<typeof GetIntradayCandleDataArgsSchema>;

interface UpstoxIntradayCandleResponse {
    status: string;
    data: {
        candles: Array<[string, number, number, number, number, number, number]>;
    };
}

export const getIntradayCandleDataHandler: ToolHandler<GetIntradayCandleDataArgs> = async (
    args: GetIntradayCandleDataArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetIntradayCandleDataArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const encodedKey = encodeURIComponent(validatedArgs.instrument_key);
    const path = `${UPSTOX_API_HISTORICAL_CANDLE_V2_ENDPOINT}/intraday/${encodedKey}/${validatedArgs.interval}`;

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

    const data = await response.json() as UpstoxIntradayCandleResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
