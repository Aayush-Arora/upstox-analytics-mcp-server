export const UPSTOX_API_BASE_URL = "https://api.upstox.com";

// Historical Data
export const UPSTOX_API_HISTORICAL_CANDLE_V3_ENDPOINT = "/v3/historical-candle";
export const UPSTOX_API_HISTORICAL_CANDLE_V2_ENDPOINT = "/v2/historical-candle";

// Market Quote
export const UPSTOX_API_FULL_MARKET_QUOTE_ENDPOINT = "/v2/market-quote/quotes";
export const UPSTOX_API_MARKET_QUOTE_OHLC_V2_ENDPOINT = "/v2/market-quote/ohlc";
export const UPSTOX_API_MARKET_QUOTE_OHLC_V3_ENDPOINT = "/v3/market-quote/ohlc";
export const UPSTOX_API_LTP_V2_ENDPOINT = "/v2/market-quote/ltp";
export const UPSTOX_API_LTP_V3_ENDPOINT = "/v3/market-quote/ltp";
export const UPSTOX_API_OPTION_GREEKS_ENDPOINT = "/v3/market-quote/option-greek";

// Option Chain
export const UPSTOX_API_OPTION_CONTRACTS_ENDPOINT = "/v2/option/contract";
export const UPSTOX_API_OPTION_CHAIN_ENDPOINT = "/v2/option/chain";

// Instruments
export const UPSTOX_API_INSTRUMENTS_SEARCH_ENDPOINT = "/v2/instruments/search";

export const HEADERS = {
  ACCEPT: "application/json",
};

export const ERROR_MESSAGES = {
  API_ERROR: "Error occurred while calling Upstox API",
};
