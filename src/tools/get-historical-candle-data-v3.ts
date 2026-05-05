import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_HISTORICAL_CANDLE_V3_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getHistoricalCandleDataV3Schema = {
    instrument_key: z.string().describe("Instrument key e.g. NSE_EQ|INE848E01016"),
    unit: z.enum(["minutes", "hours", "days", "weeks", "months"]).describe("Timeframe unit"),
    interval: z.string().describe("Interval value: 1-300 for minutes, 1-5 for hours, 1 for days/weeks/months"),
    to_date: z.string().describe("End date inclusive in YYYY-MM-DD format"),
    from_date: z.string().optional().describe("Start date in YYYY-MM-DD format (optional)"),
};

const GetHistoricalCandleDataV3ArgsSchema = z.object(getHistoricalCandleDataV3Schema);

type GetHistoricalCandleDataV3Args = z.infer<typeof GetHistoricalCandleDataV3ArgsSchema>;

interface UpstoxHistoricalCandleResponse {
    status: string;
    data: {
        candles: Array<[string, number, number, number, number, number, number]>;
    };
}

export const getHistoricalCandleDataV3Handler: ToolHandler<GetHistoricalCandleDataV3Args> = async (
    args: GetHistoricalCandleDataV3Args,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetHistoricalCandleDataV3ArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const encodedKey = encodeURIComponent(validatedArgs.instrument_key);
    let path = `${UPSTOX_API_HISTORICAL_CANDLE_V3_ENDPOINT}/${encodedKey}/${validatedArgs.unit}/${validatedArgs.interval}/${validatedArgs.to_date}`;
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
