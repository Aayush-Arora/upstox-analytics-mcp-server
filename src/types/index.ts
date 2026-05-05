import { z } from "zod";

export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  } | {
    type: "image";
    data: string;
    mimeType: string;
  } | {
    type: "resource";
    resource: {
      text: string;
      uri: string;
      mimeType?: string;
    } | {
      uri: string;
      blob: string;
      mimeType?: string;
    };
  }>;
  _meta?: {
    [key: string]: unknown;
  };
  metadata?: {
    errorType?: "API_ERROR";
    [key: string]: any;
  };
  isError?: boolean;
}

export interface ToolHandler<T> {
  (args: T, extra: { [key: string]: unknown }): Promise<ToolResponse>;
}

export interface ToolEnv extends Env {
  UPSTOX_ANALYTICS_TOKEN: string;
}
