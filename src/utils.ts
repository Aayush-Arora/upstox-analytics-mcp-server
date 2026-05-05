import { ToolResponse } from "./types";

export function createTokenNotFoundError(): ToolResponse {
    return {
        content: [{
            type: "text",
            text: "Error: UPSTOX_ANALYTICS_TOKEN not configured. Please set the analytics token in environment variables."
        }],
        isError: true,
        metadata: {
            errorType: "API_ERROR"
        }
    };
}
