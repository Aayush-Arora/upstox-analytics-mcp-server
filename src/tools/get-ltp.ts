import { z } from "zod";
import { ToolHandler, ToolResponse, ToolEnv } from "../types";
import {
    UPSTOX_API_BASE_URL,
    UPSTOX_API_LTP_V2_ENDPOINT,
    HEADERS,
    ERROR_MESSAGES
} from "../constants";
import { createTokenNotFoundError } from "../utils";

export const getLtpSchema = {
    instrument_key: z.string().describe("Comma separated list of instrument keys, max 500"),
};

const GetLtpArgsSchema = z.object(getLtpSchema);

type GetLtpArgs = z.infer<typeof GetLtpArgsSchema>;

interface UpstoxLtpResponse {
    status: string;
    data: {
        [instrument_key: string]: {
            last_price: number;
            instrument_token: string;
        };
    };
}

export const getLtpHandler: ToolHandler<GetLtpArgs> = async (
    args: GetLtpArgs,
    extra: { [key: string]: unknown }
): Promise<ToolResponse> => {
    const validatedArgs = GetLtpArgsSchema.parse(args);

    const env = extra.env as ToolEnv;
    const analyticsToken = env?.UPSTOX_ANALYTICS_TOKEN;
    if (!analyticsToken) {
        return createTokenNotFoundError();
    }

    const url = new URL(`${UPSTOX_API_BASE_URL}${UPSTOX_API_LTP_V2_ENDPOINT}`);
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

    const data = await response.json() as UpstoxLtpResponse;

    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }]
    };
};
