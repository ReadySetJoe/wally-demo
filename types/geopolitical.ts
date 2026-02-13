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
  // Grains
  corn: ['corn', 'maize', 'ethanol', 'feed grain', 'corn belt', 'usda corn'],
  wheat: ['wheat', 'grain', 'bread', 'flour', 'black sea', 'wheat export', 'winter wheat', 'spring wheat'],
  soybeans: ['soybean', 'soy', 'oilseed', 'soybean oil', 'soy meal', 'brazil soy', 'china soy'],
  // Softs
  orange_juice: ['orange', 'citrus', 'juice', 'fcoj', 'florida citrus', 'orange grove', 'citrus greening'],
  coffee: ['coffee', 'arabica', 'robusta', 'cafe', 'brazil coffee', 'coffee bean', 'coffee harvest'],
  sugar: ['sugar', 'sugarcane', 'sugar beet', 'ethanol', 'brazil sugar', 'raw sugar', 'refined sugar'],
  cotton: ['cotton', 'textile', 'cotton harvest', 'cotton belt', 'cotton export', 'fiber'],
  cocoa: ['cocoa', 'chocolate', 'cacao', 'ivory coast', 'ghana cocoa', 'cocoa bean', 'cocoa harvest'],
  // Produce
  tomatoes: ['tomato', 'tomatoes', 'fresh produce', 'vegetable', 'greenhouse', 'salad'],
  avocados: ['avocado', 'avocados', 'guacamole', 'mexico avocado', 'hass avocado', 'california avocado'],
  almonds: ['almond', 'almonds', 'tree nut', 'nut', 'california almond', 'almond harvest'],
  lettuce: ['lettuce', 'salad', 'romaine', 'iceberg', 'leafy green', 'salinas', 'yuma lettuce'],
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
  // Grains
  corn: ['united states', 'usa', 'brazil', 'argentina', 'china', 'ukraine', 'mexico'],
  wheat: ['russia', 'ukraine', 'united states', 'usa', 'canada', 'australia', 'india', 'black sea', 'european union', 'eu'],
  soybeans: ['brazil', 'united states', 'usa', 'argentina', 'china', 'paraguay'],
  // Softs
  orange_juice: ['united states', 'usa', 'florida', 'brazil', 'mexico', 'spain'],
  coffee: ['brazil', 'vietnam', 'colombia', 'ethiopia', 'honduras', 'indonesia', 'central america'],
  sugar: ['brazil', 'india', 'thailand', 'china', 'united states', 'usa', 'australia'],
  cotton: ['united states', 'usa', 'china', 'india', 'brazil', 'pakistan', 'australia', 'uzbekistan'],
  cocoa: ['ivory coast', 'ghana', 'ecuador', 'cameroon', 'nigeria', 'indonesia', 'west africa'],
  // Produce
  tomatoes: ['united states', 'usa', 'mexico', 'california', 'florida', 'spain', 'turkey'],
  avocados: ['mexico', 'united states', 'usa', 'california', 'peru', 'chile', 'colombia'],
  almonds: ['united states', 'usa', 'california', 'spain', 'australia', 'iran'],
  lettuce: ['united states', 'usa', 'california', 'arizona', 'mexico', 'spain'],
};
