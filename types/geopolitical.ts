import { CommodityName } from './commodity';

export type EventCategory = 'trade' | 'conflict' | 'sanctions' | 'policy' | 'weather' | 'supply';

export interface GeopoliticalEvent {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: EventCategory;
  sentiment: number; // -1 (bearish) to 1 (bullish)
  relevance: number; // 0 to 1
  affectedCommodities: CommodityName[];
  region: string;
  impactScore: number; // -1 to 1 (negative = bearish, positive = bullish)
}

export interface GeopoliticalRisk {
  commodity: CommodityName;
  overallRisk: number; // 0 to 1 (0 = low risk, 1 = high risk)
  sentiment: number; // -1 to 1
  signalImpact: 'bullish' | 'bearish' | 'neutral';
  topEvents: GeopoliticalEvent[];
  riskFactors: {
    trade: number;
    conflict: number;
    sanctions: number;
    policy: number;
  };
}

export interface GeopoliticalSummary {
  overallMarketRisk: number;
  commodityRisks: GeopoliticalRisk[];
  recentEvents: GeopoliticalEvent[];
  lastUpdated: string;
}

// Keywords for detecting commodity relevance
export const COMMODITY_KEYWORDS: Record<CommodityName, string[]> = {
  corn: ['corn', 'maize', 'ethanol', 'feed grain', 'corn belt', 'usda corn'],
  wheat: ['wheat', 'grain', 'bread', 'flour', 'black sea', 'wheat export', 'winter wheat', 'spring wheat'],
  soybeans: ['soybean', 'soy', 'oilseed', 'soybean oil', 'soy meal', 'brazil soy', 'china soy'],
};

// Keywords for detecting event categories
export const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  trade: ['tariff', 'trade war', 'export ban', 'import', 'trade deal', 'trade agreement', 'wto', 'trade policy', 'trade restriction'],
  conflict: ['war', 'conflict', 'military', 'invasion', 'attack', 'troops', 'missile', 'combat', 'fighting'],
  sanctions: ['sanction', 'embargo', 'blacklist', 'restriction', 'ban', 'penalty', 'blocked'],
  policy: ['policy', 'regulation', 'subsidy', 'government', 'minister', 'legislation', 'law', 'mandate'],
  weather: ['drought', 'flood', 'storm', 'hurricane', 'frost', 'heat wave', 'rainfall', 'climate'],
  supply: ['supply', 'shortage', 'surplus', 'production', 'harvest', 'yield', 'stockpile', 'inventory', 'export'],
};

// Regions that significantly impact each commodity
export const COMMODITY_REGIONS: Record<CommodityName, string[]> = {
  corn: ['united states', 'usa', 'brazil', 'argentina', 'china', 'ukraine', 'mexico'],
  wheat: ['russia', 'ukraine', 'united states', 'usa', 'canada', 'australia', 'india', 'black sea', 'european union', 'eu'],
  soybeans: ['brazil', 'united states', 'usa', 'argentina', 'china', 'paraguay'],
};
