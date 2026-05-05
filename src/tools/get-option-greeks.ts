import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_OPTION_GREEKS_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getOptionGreeksSchema = {
    instrument_key: z.string().describe("Comma separated list of option instrument keys, max 50"),
};

const GetOptionGreeksArgsSchema = z.object(getOptionGreeksSchema);

type GetOptionGreeksArgs = z.infer<typeof GetOptionGreeksArgsSchema>;

interface UpstoxOptionGreeksResponse {
    status: string;
    data: {
        [instrument_key: string]: {
            last_price: number;
            instrument_token: string;
            ltq: number;
            volume: number;
            cp: number;
            iv: number;
            vega: number;
            gamma: number;
            theta: number;
            delta: number;
            oi: number;
        };
    };
}

export const getOptionGreeksHandler: ToolHandler<GetOptionGreeksArgs> = async (
    args: GetOptionGreeksArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetOptionGreeksArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_OPTION_GREEKS_ENDPOINT}`);
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

    const data = await response.json() as UpstoxOptionGreeksResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
