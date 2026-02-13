import { CommodityName } from './commodity';
import { DroughtLevel } from './weather';

export type SignalType = 'short' | 'avoid_short' | 'neutral';

export interface ShortSellSignal {
  id: string;
  region: string;
  states: string[];
  commodity: CommodityName;
  signalType: SignalType;
  strength: number; // 0 to 1
  weatherFactors: {
    droughtLevel: DroughtLevel;
    droughtScore: number; // 0-4
    precipAnomaly: number;
    tempAnomaly: number;
  };
  priceFactors: {
    currentPrice: number;
    thirtyDayChange: number;
  };
  rationale: string[];
  updatedAt: string;
}

export interface SignalSummary {
  totalSignals: number;
  shortOpportunities: number;
  avoidShort: number;
  neutral: number;
  topSignal: ShortSellSignal | null;
  signals: ShortSellSignal[];
  generatedAt: string;
}

export interface StateSignal {
  stateCode: string;
  signals: ShortSellSignal[];
  aggregateScore: number; // -1 (avoid short) to 1 (short opportunity)
  dominantSignal: SignalType;
}
