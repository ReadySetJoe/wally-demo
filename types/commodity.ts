// Real futures symbols (traded on exchanges)
export type RealCommoditySymbol = 'ZC=F' | 'ZW=F' | 'ZS=F' | 'OJ=F' | 'KC=F' | 'SB=F' | 'CT=F' | 'CC=F';

// Simulated commodities (no major futures market)
export type SimulatedCommoditySymbol = 'SIM:TOMATO' | 'SIM:AVOCADO' | 'SIM:ALMOND' | 'SIM:LETTUCE';

export type CommoditySymbol = RealCommoditySymbol | SimulatedCommoditySymbol;

export type CommodityName =
  | 'corn' | 'wheat' | 'soybeans'  // Grains
  | 'orange_juice' | 'coffee' | 'sugar' | 'cotton' | 'cocoa'  // Softs
  | 'tomatoes' | 'avocados' | 'almonds' | 'lettuce';  // Simulated

export type CommodityCategory = 'grains' | 'softs' | 'produce';

export interface CommodityPrice {
  symbol: CommoditySymbol;
  name: CommodityName;
  displayName: string;
  category: CommodityCategory;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  updatedAt: string;
  isSimulated: boolean;
}

export interface CommodityHistorical {
  symbol: CommoditySymbol;
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface CommodityInfo {
  name: CommodityName;
  displayName: string;
  category: CommodityCategory;
  unit: string;
  isSimulated: boolean;
}

export const COMMODITY_MAP: Record<CommoditySymbol, CommodityInfo> = {
  // Grains (CME)
  'ZC=F': { name: 'corn', displayName: 'Corn Futures', category: 'grains', unit: '¢/bushel', isSimulated: false },
  'ZW=F': { name: 'wheat', displayName: 'Wheat Futures', category: 'grains', unit: '¢/bushel', isSimulated: false },
  'ZS=F': { name: 'soybeans', displayName: 'Soybean Futures', category: 'grains', unit: '¢/bushel', isSimulated: false },

  // Softs (ICE)
  'OJ=F': { name: 'orange_juice', displayName: 'Orange Juice (FCOJ)', category: 'softs', unit: '¢/lb', isSimulated: false },
  'KC=F': { name: 'coffee', displayName: 'Coffee Futures', category: 'softs', unit: '¢/lb', isSimulated: false },
  'SB=F': { name: 'sugar', displayName: 'Sugar #11 Futures', category: 'softs', unit: '¢/lb', isSimulated: false },
  'CT=F': { name: 'cotton', displayName: 'Cotton Futures', category: 'softs', unit: '¢/lb', isSimulated: false },
  'CC=F': { name: 'cocoa', displayName: 'Cocoa Futures', category: 'softs', unit: '$/ton', isSimulated: false },

  // Simulated produce (no major futures market)
  'SIM:TOMATO': { name: 'tomatoes', displayName: 'Tomatoes (Simulated)', category: 'produce', unit: '$/cwt', isSimulated: true },
  'SIM:AVOCADO': { name: 'avocados', displayName: 'Avocados (Simulated)', category: 'produce', unit: '$/case', isSimulated: true },
  'SIM:ALMOND': { name: 'almonds', displayName: 'Almonds (Simulated)', category: 'produce', unit: '$/lb', isSimulated: true },
  'SIM:LETTUCE': { name: 'lettuce', displayName: 'Lettuce (Simulated)', category: 'produce', unit: '$/carton', isSimulated: true },
};

// Get all symbols by category
export const COMMODITY_SYMBOLS_BY_CATEGORY: Record<CommodityCategory, CommoditySymbol[]> = {
  grains: ['ZC=F', 'ZW=F', 'ZS=F'],
  softs: ['OJ=F', 'KC=F', 'SB=F', 'CT=F', 'CC=F'],
  produce: ['SIM:TOMATO', 'SIM:AVOCADO', 'SIM:ALMOND', 'SIM:LETTUCE'],
};

export const ALL_COMMODITY_SYMBOLS: CommoditySymbol[] = Object.values(COMMODITY_SYMBOLS_BY_CATEGORY).flat();
