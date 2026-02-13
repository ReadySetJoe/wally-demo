import {
  CommodityPrice,
  CommoditySymbol,
  RealCommoditySymbol,
  SimulatedCommoditySymbol,
  COMMODITY_MAP,
  ALL_COMMODITY_SYMBOLS,
  COMMODITY_SYMBOLS_BY_CATEGORY,
} from '@/types/commodity';

interface YahooQuoteResponse {
  chart: {
    result: {
      meta: {
        regularMarketPrice: number;
        previousClose: number;
        regularMarketDayHigh: number;
        regularMarketDayLow: number;
        regularMarketVolume: number;
      };
      timestamp: number[];
      indicators: {
        quote: {
          close: number[];
          high: number[];
          low: number[];
          open: number[];
          volume: number[];
        }[];
      };
    }[];
    error: null | { code: string; description: string };
  };
}

// Simulated prices for produce (no real futures market)
const SIMULATED_BASE_PRICES: Record<SimulatedCommoditySymbol, { price: number; volatility: number }> = {
  'SIM:TOMATO': { price: 28.50, volatility: 0.08 },    // $/cwt
  'SIM:AVOCADO': { price: 42.00, volatility: 0.12 },   // $/case
  'SIM:ALMOND': { price: 3.25, volatility: 0.05 },     // $/lb
  'SIM:LETTUCE': { price: 18.75, volatility: 0.10 },   // $/carton
};

function generateSimulatedPrice(symbol: SimulatedCommoditySymbol): CommodityPrice {
  const config = SIMULATED_BASE_PRICES[symbol];
  const info = COMMODITY_MAP[symbol];

  // Use date-based seed for consistent daily prices
  const today = new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = ((seed << 5) - seed) + today.charCodeAt(i) + symbol.charCodeAt(i % symbol.length);
  }

  // Seeded random for daily variation
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const variation = (random() - 0.5) * 2 * config.volatility;
  const price = config.price * (1 + variation);
  const prevVariation = (random() - 0.5) * 2 * config.volatility;
  const previousClose = config.price * (1 + prevVariation);
  const change = price - previousClose;

  return {
    symbol,
    name: info.name,
    displayName: info.displayName,
    category: info.category,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / previousClose) * 10000) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    dayHigh: Math.round(price * 1.02 * 100) / 100,
    dayLow: Math.round(price * 0.98 * 100) / 100,
    volume: Math.floor(random() * 5000) + 1000,
    updatedAt: new Date().toISOString(),
    isSimulated: true,
  };
}

export async function fetchCommodityPrice(symbol: CommoditySymbol): Promise<CommodityPrice> {
  const info = COMMODITY_MAP[symbol];

  // Handle simulated commodities
  if (info.isSimulated) {
    return generateSimulatedPrice(symbol as SimulatedCommoditySymbol);
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error('Yahoo Finance API error:', response.status);
      return getMockPrice(symbol as RealCommoditySymbol);
    }

    const data: YahooQuoteResponse = await response.json();

    if (data.chart.error || !data.chart.result?.[0]) {
      console.error('Yahoo Finance data error:', data.chart.error);
      return getMockPrice(symbol as RealCommoditySymbol);
    }

    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice ?? 0;
    const previousClose = meta.previousClose ?? price;
    const change = previousClose ? price - previousClose : 0;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      name: info.name,
      displayName: info.displayName,
      category: info.category,
      price,
      change,
      changePercent,
      previousClose,
      dayHigh: meta.regularMarketDayHigh ?? price,
      dayLow: meta.regularMarketDayLow ?? price,
      volume: meta.regularMarketVolume ?? 0,
      updatedAt: new Date().toISOString(),
      isSimulated: false,
    };
  } catch (error) {
    console.error('Failed to fetch commodity price:', error);
    return getMockPrice(symbol as RealCommoditySymbol);
  }
}

export async function fetchAllCommodityPrices(): Promise<CommodityPrice[]> {
  return Promise.all(ALL_COMMODITY_SYMBOLS.map(fetchCommodityPrice));
}

export async function fetchCommodityPricesByCategory(category: 'grains' | 'softs' | 'produce'): Promise<CommodityPrice[]> {
  const symbols = COMMODITY_SYMBOLS_BY_CATEGORY[category];
  return Promise.all(symbols.map(fetchCommodityPrice));
}

export async function fetchCommodityHistory(symbol: CommoditySymbol, range: '1mo' | '3mo' | '1y' = '1mo') {
  const info = COMMODITY_MAP[symbol];

  // Handle simulated commodities
  if (info.isSimulated) {
    return getMockHistory(symbol);
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return getMockHistory(symbol);
    }

    const data: YahooQuoteResponse = await response.json();

    if (data.chart.error || !data.chart.result?.[0]) {
      return getMockHistory(symbol);
    }

    const result = data.chart.result[0];
    const quotes = result.indicators.quote[0];

    return {
      symbol,
      data: result.timestamp.map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: quotes.open[i],
        high: quotes.high[i],
        low: quotes.low[i],
        close: quotes.close[i],
        volume: quotes.volume[i],
      })).filter(d => d.close !== null),
    };
  } catch (error) {
    console.error('Failed to fetch commodity history:', error);
    return getMockHistory(symbol);
  }
}

// Mock prices for real futures (fallback)
function getMockPrice(symbol: RealCommoditySymbol): CommodityPrice {
  const mockPrices: Record<RealCommoditySymbol, { price: number; prev: number }> = {
    'ZC=F': { price: 456.25, prev: 452.50 },
    'ZW=F': { price: 612.75, prev: 618.00 },
    'ZS=F': { price: 1142.50, prev: 1138.25 },
    'OJ=F': { price: 285.40, prev: 282.15 },
    'KC=F': { price: 187.65, prev: 185.20 },
    'SB=F': { price: 21.45, prev: 21.80 },
    'CT=F': { price: 78.32, prev: 77.85 },
    'CC=F': { price: 5245.00, prev: 5180.00 },
  };

  const mock = mockPrices[symbol];
  const info = COMMODITY_MAP[symbol];
  const change = mock.price - mock.prev;

  return {
    symbol,
    name: info.name,
    displayName: info.displayName,
    category: info.category,
    price: mock.price,
    change,
    changePercent: (change / mock.prev) * 100,
    previousClose: mock.prev,
    dayHigh: mock.price * 1.01,
    dayLow: mock.price * 0.99,
    volume: Math.floor(Math.random() * 50000) + 10000,
    updatedAt: new Date().toISOString(),
    isSimulated: false,
  };
}

function getMockHistory(symbol: CommoditySymbol) {
  const basePrices: Record<string, number> = {
    'ZC=F': 450, 'ZW=F': 600, 'ZS=F': 1100,
    'OJ=F': 280, 'KC=F': 185, 'SB=F': 21, 'CT=F': 78, 'CC=F': 5200,
    'SIM:TOMATO': 28, 'SIM:AVOCADO': 42, 'SIM:ALMOND': 3.25, 'SIM:LETTUCE': 18,
  };

  const basePrice = basePrices[symbol] || 100;
  const data = [];
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * basePrice * 0.1;
    const price = basePrice + variation;

    data.push({
      date: date.toISOString().split('T')[0],
      open: price - 2,
      high: price + 5,
      low: price - 5,
      close: price,
      volume: Math.floor(Math.random() * 50000) + 10000,
    });
  }

  return { symbol, data };
}
