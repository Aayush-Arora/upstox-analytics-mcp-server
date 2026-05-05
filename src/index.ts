import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    getHistoricalCandleDataV3Schema, getHistoricalCandleDataV3Handler,
    getIntradayCandleDataV3Schema, getIntradayCandleDataV3Handler,
    getHistoricalCandleDataSchema, getHistoricalCandleDataHandler,
    getIntradayCandleDataSchema, getIntradayCandleDataHandler,
    getFullMarketQuoteSchema, getFullMarketQuoteHandler,
    getMarketQuoteOhlcSchema, getMarketQuoteOhlcHandler,
    getMarketQuoteOhlcV3Schema, getMarketQuoteOhlcV3Handler,
    getLtpSchema, getLtpHandler,
    getLtpV3Schema, getLtpV3Handler,
    getOptionGreeksSchema, getOptionGreeksHandler,
    getOptionContractsSchema, getOptionContractsHandler,
    getOptionChainSchema, getOptionChainHandler,
    searchInstrumentsSchema, searchInstrumentsHandler,
} from "./tools";

export class MyMCP extends McpAgent {
    server = new McpServer({
        name: "Upstox Analytics MCP Agent",
        version: "1.0.0",
    });

    async init() {
        console.log("Upstox Analytics MCP Agent initialized");

        this.server.tool(
            "get-historical-candle-data-v3",
            getHistoricalCandleDataV3Schema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getHistoricalCandleDataV3Handler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-intraday-candle-data-v3",
            getIntradayCandleDataV3Schema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getIntradayCandleDataV3Handler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-historical-candle-data",
            getHistoricalCandleDataSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getHistoricalCandleDataHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-intraday-candle-data",
            getIntradayCandleDataSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getIntradayCandleDataHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-full-market-quote",
            getFullMarketQuoteSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getFullMarketQuoteHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-market-quote-ohlc",
            getMarketQuoteOhlcSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getMarketQuoteOhlcHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-market-quote-ohlc-v3",
            getMarketQuoteOhlcV3Schema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getMarketQuoteOhlcV3Handler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-ltp",
            getLtpSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getLtpHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-ltp-v3",
            getLtpV3Schema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getLtpV3Handler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-option-greeks",
            getOptionGreeksSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getOptionGreeksHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-option-contracts",
            getOptionContractsSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getOptionContractsHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "get-option-chain",
            getOptionChainSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return getOptionChainHandler(args as any, enhancedExtra);
            }
        );

        this.server.tool(
            "search-instruments",
            searchInstrumentsSchema,
            { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
            async (args, extra) => {
                const enhancedExtra = { ...extra, env: this.env };
                return searchInstrumentsHandler(args as any, enhancedExtra);
            }
        );
    }
}

export default MyMCP.serve("/mcp");
