# upstox-analytics-mcp-server

A MCP server for Upstox read-only analytics APIs — historical data, market quotes, option chain, and news. Uses an Upstox analytics token (no API key or secret required).

## Quick Start

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/upstox-analytics-mcp-server.git
cd upstox-analytics-mcp-server
```

2. Install dependencies:

```bash
npm install
```

### Running locally

1. **Get an Upstox Analytics Token**
   Log in to your Upstox account and obtain an analytics token. This is a read-only token that does not require an API app registration.

2. **Configure credentials**
   Create a file named `.dev.vars` in the project root and add your analytics token:

   ```
   UPSTOX_ANALYTICS_TOKEN=your_analytics_token_here
   ```

3. **Start the application**

   ```bash
   npm start
   ```

Your MCP server will be running at `http://localhost:8787`.

## MCP Configuration

### Claude Desktop Configuration

To use this MCP server with Claude Desktop, add the following configuration to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "upstox-analytics-mcp-server": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/mcp"
      ]
    }
  }
}
```

### Cursor MCP Configuration

To use this MCP server with Cursor, add the following configuration to your Cursor MCP settings (usually located at `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "upstox-analytics-mcp-server": {
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

## Using with Claude and Cursor

You can interact with the Upstox analytics APIs through natural language prompts. Here are some example prompts for each tool:

### Historical Candle Data (V3)

- "Get daily OHLC candles for RELIANCE from 2025-01-01 to 2025-03-31"
- "Fetch 1-minute candle data for NSE_EQ|INE848E01016 for today"
- "Show me weekly candles for Nifty 50 index over the last 6 months"
- "Get 30-minute historical candles for HDFC Bank from last month"

### Intraday Candle Data (V3)

- "Show me today's 5-minute candles for INFY"
- "Get intraday 1-hour candle data for NSE_EQ|INE009A01021"
- "Fetch real-time 15-minute candles for TATAMOTORS today"

### Historical Candle Data (V2)

- "Get 30-minute candles for SBIN from 2024-11-01 to 2024-11-30"
- "Fetch daily OHLC for WIPRO for the past year"
- "Show me monthly candles for BAJFINANCE for the last 5 years"

### Intraday Candle Data (V2)

- "Get today's 1-minute candles for HCLTECH"
- "Fetch 30-minute intraday data for NSE_EQ|INE860A01027"

### Full Market Quote

- "Get the full market quote for RELIANCE and INFY"
- "Show me the order book depth for NSE_EQ|INE848E01016"
- "What are the circuit limits for TATAMOTORS?"
- "Get live bid-ask data for HDFC Bank and ICICI Bank"

### OHLC Market Quote (V2)

- "Get today's OHLC for NIFTY 50 and BANKNIFTY"
- "Show me the 1-minute OHLC snapshot for RELIANCE"
- "Fetch 30-minute OHLC for NSE_EQ|INE002A01018"

### OHLC Market Quote (V3)

- "Get both previous and live OHLC for INFY and WIPRO"
- "Show me live vs previous session OHLC for HDFCBANK"
- "Fetch V3 OHLC data with volume for top 5 Nifty stocks"

### LTP (V2)

- "What is the current price of RELIANCE?"
- "Get last traded price for NSE_EQ|INE848E01016 and NSE_EQ|INE009A01021"
- "Show me the LTP for TATASTEEL and HINDALCO"

### LTP (V3)

- "Get live price, volume, and previous close for SBIN"
- "Show me LTP with last traded quantity for BAJFINANCE"
- "Fetch real-time price and volume data for NIFTYBANK index"

### Option Greeks

- "Get delta and theta for this NIFTY call option: NSE_FO|12345"
- "Show me IV and vega for these option instruments"
- "What are the Greeks for BANKNIFTY put options expiring this week?"

### Option Contracts

- "List all NIFTY option contracts expiring on 2025-03-27"
- "Show me available strike prices for BANKNIFTY options"
- "Get all CE and PE contracts for NSE_INDEX|Nifty 50"
- "What option contracts are available for RELIANCE?"

### Option Chain

- "Show me the full option chain for NIFTY expiring 2025-03-27"
- "Get put/call data with Greeks for BANKNIFTY options"
- "What's the PCR for NIFTY at each strike for this expiry?"
- "Show me open interest and IV across NIFTY strikes"

### News

- "Get latest news for RELIANCE and INFY"
- "Show me news articles for NSE_EQ|INE848E01016 and NSE_EQ|INE009A01021"
- "Fetch news for my current positions"
- "What's the latest news for my holdings?"

## Available Tools

| Tool | Method | Description |
|------|--------|-------------|
| `get-historical-candle-data-v3` | GET | Fetch historical OHLC candles with expanded interval options (V3). Supports minutes/hours/days/weeks/months units |
| `get-intraday-candle-data-v3` | GET | Fetch current trading day OHLC candles with expanded interval options (V3) |
| `get-historical-candle-data` | GET | Fetch historical OHLC candles (V2). Supports 1minute, 30minute, day, week, month intervals |
| `get-intraday-candle-data` | GET | Fetch current trading day OHLC candles (V2). Supports 1minute and 30minute intervals |
| `get-full-market-quote` | GET | Get full market quotes including OHLC, depth, volume, OI, and circuit limits for up to 500 instruments |
| `get-market-quote-ohlc` | GET | Get OHLC market quotes for up to 500 instruments (V2). Supports 1d, I1, I30 intervals |
| `get-market-quote-ohlc-v3` | GET | Get OHLC market quotes with separate prev and live OHLC for up to 500 instruments (V3) |
| `get-ltp` | GET | Get last traded price for up to 500 instruments (V2) |
| `get-ltp-v3` | GET | Get last traded price with volume, LTQ, and previous close for up to 500 instruments (V3) |
| `get-option-greeks` | GET | Retrieve option Greeks (delta, gamma, theta, vega, IV) for up to 50 option instruments |
| `get-option-contracts` | GET | List active option contracts for an underlying instrument with optional expiry filter |
| `get-option-chain` | GET | Get full put/call option chain with Greeks and market data for a given underlying and expiry |
| `get-news` | GET | Fetch news articles (last 7 days) for up to 30 instrument keys, current positions, or holdings |
