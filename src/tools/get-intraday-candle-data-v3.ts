import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_HISTORICAL_CANDLE_V3_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getIntradayCandleDataV3Schema = {
    instrument_key: z.string().describe("Instrument key e.g. NSE_EQ|INE848E01016"),
    unit: z.enum(["minutes", "hours", "days"]).describe("Timeframe unit"),
    interval: z.string().describe("Interval value: 1-300 for minutes, 1-5 for hours, 1 for days"),
};

const GetIntradayCandleDataV3ArgsSchema = z.object(getIntradayCandleDataV3Schema);

type GetIntradayCandleDataV3Args = z.infer<typeof GetIntradayCandleDataV3ArgsSchema>;

interface UpstoxIntradayCandleResponse {
    status: string;
    data: {
        candles: Array<[string, number, number, number, number, number, number]>;
    };
}

export const getIntradayCandleDataV3Handler: ToolHandler<GetIntradayCandleDataV3Args> = async (
    args: GetIntradayCandleDataV3Args,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetIntradayCandleDataV3ArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const encodedKey = encodeURIComponent(validatedArgs.instrument_key);
    const path = `${UPSTOX_API_HISTORICAL_CANDLE_V3_ENDPOINT}/intraday/${encodedKey}/${validatedArgs.unit}/${validatedArgs.interval}`;

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
