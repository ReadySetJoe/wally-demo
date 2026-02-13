import { CommodityName } from '@/types/commodity';
import { DroughtLevel } from '@/types/weather';

export interface WeatherImpact {
  commodity: CommodityName;
  impact: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-1
  rationale: string;
}

// Drought severity scores (0-4 scale)
const DROUGHT_SCORES: Record<DroughtLevel, number> = {
  'None': 0,
  'D0': 1,
  'D1': 2,
  'D2': 3,
  'D3': 4,
  'D4': 5,
};

// Impact rules: Drought generally bullish for prices (less supply)
// High drought score = avoid shorting (prices likely to rise)
// Low drought score = potential short opportunity (good supply)
const DROUGHT_IMPACT_RULES: Record<CommodityName, Record<string, WeatherImpact>> = {
  // Grains
  corn: {
    none_d0: { commodity: 'corn', impact: 'bearish', confidence: 0.4, rationale: 'Favorable growing conditions support yields' },
    d1: { commodity: 'corn', impact: 'neutral', confidence: 0.3, rationale: 'Mild stress, monitoring needed' },
    d2_d3: { commodity: 'corn', impact: 'bullish', confidence: 0.7, rationale: 'Significant yield reduction expected' },
    d4: { commodity: 'corn', impact: 'bullish', confidence: 0.9, rationale: 'Severe crop damage likely' },
  },
  wheat: {
    none_d0: { commodity: 'wheat', impact: 'bearish', confidence: 0.35, rationale: 'Good conditions favor production' },
    d1: { commodity: 'wheat', impact: 'neutral', confidence: 0.25, rationale: 'Wheat tolerates mild drought' },
    d2_d3: { commodity: 'wheat', impact: 'bullish', confidence: 0.55, rationale: 'Yield stress becoming significant' },
    d4: { commodity: 'wheat', impact: 'bullish', confidence: 0.8, rationale: 'Major production losses expected' },
  },
  soybeans: {
    none_d0: { commodity: 'soybeans', impact: 'bearish', confidence: 0.4, rationale: 'Adequate moisture supports pod development' },
    d1: { commodity: 'soybeans', impact: 'neutral', confidence: 0.3, rationale: 'Minor stress during growth phase' },
    d2_d3: { commodity: 'soybeans', impact: 'bullish', confidence: 0.65, rationale: 'Critical moisture deficit during pod fill' },
    d4: { commodity: 'soybeans', impact: 'bullish', confidence: 0.85, rationale: 'Severe damage to soybean crop' },
  },
  // Softs
  orange_juice: {
    none_d0: { commodity: 'orange_juice', impact: 'bearish', confidence: 0.5, rationale: 'Good conditions for citrus groves' },
    d1: { commodity: 'orange_juice', impact: 'neutral', confidence: 0.35, rationale: 'Minor stress on citrus trees' },
    d2_d3: { commodity: 'orange_juice', impact: 'bullish', confidence: 0.75, rationale: 'Water stress reduces fruit quality and yield' },
    d4: { commodity: 'orange_juice', impact: 'bullish', confidence: 0.95, rationale: 'Severe drought threatens citrus crop' },
  },
  coffee: {
    none_d0: { commodity: 'coffee', impact: 'bearish', confidence: 0.45, rationale: 'Favorable conditions for coffee production' },
    d1: { commodity: 'coffee', impact: 'neutral', confidence: 0.3, rationale: 'Minor stress on coffee plants' },
    d2_d3: { commodity: 'coffee', impact: 'bullish', confidence: 0.7, rationale: 'Drought impacts cherry development' },
    d4: { commodity: 'coffee', impact: 'bullish', confidence: 0.9, rationale: 'Severe impact on coffee harvest' },
  },
  sugar: {
    none_d0: { commodity: 'sugar', impact: 'bearish', confidence: 0.4, rationale: 'Good moisture for sugarcane growth' },
    d1: { commodity: 'sugar', impact: 'neutral', confidence: 0.3, rationale: 'Sugarcane relatively drought-tolerant' },
    d2_d3: { commodity: 'sugar', impact: 'bullish', confidence: 0.6, rationale: 'Reduced sugarcane yields expected' },
    d4: { commodity: 'sugar', impact: 'bullish', confidence: 0.8, rationale: 'Major sugarcane production losses' },
  },
  cotton: {
    none_d0: { commodity: 'cotton', impact: 'bearish', confidence: 0.35, rationale: 'Good growing conditions for cotton' },
    d1: { commodity: 'cotton', impact: 'neutral', confidence: 0.25, rationale: 'Cotton tolerates mild drought' },
    d2_d3: { commodity: 'cotton', impact: 'bullish', confidence: 0.6, rationale: 'Boll development affected by drought' },
    d4: { commodity: 'cotton', impact: 'bullish', confidence: 0.85, rationale: 'Severe cotton crop damage' },
  },
  cocoa: {
    none_d0: { commodity: 'cocoa', impact: 'bearish', confidence: 0.5, rationale: 'Ideal conditions for cocoa trees' },
    d1: { commodity: 'cocoa', impact: 'neutral', confidence: 0.35, rationale: 'Minor stress on cocoa production' },
    d2_d3: { commodity: 'cocoa', impact: 'bullish', confidence: 0.75, rationale: 'Drought threatens cocoa pod development' },
    d4: { commodity: 'cocoa', impact: 'bullish', confidence: 0.95, rationale: 'Severe cocoa crop losses expected' },
  },
  // Produce (simulated)
  tomatoes: {
    none_d0: { commodity: 'tomatoes', impact: 'bearish', confidence: 0.45, rationale: 'Good conditions for tomato production' },
    d1: { commodity: 'tomatoes', impact: 'neutral', confidence: 0.3, rationale: 'Minor water stress on tomatoes' },
    d2_d3: { commodity: 'tomatoes', impact: 'bullish', confidence: 0.7, rationale: 'Tomatoes sensitive to water deficit' },
    d4: { commodity: 'tomatoes', impact: 'bullish', confidence: 0.9, rationale: 'Severe tomato crop damage' },
  },
  avocados: {
    none_d0: { commodity: 'avocados', impact: 'bearish', confidence: 0.5, rationale: 'Good conditions for avocado groves' },
    d1: { commodity: 'avocados', impact: 'neutral', confidence: 0.35, rationale: 'Minor stress on avocado trees' },
    d2_d3: { commodity: 'avocados', impact: 'bullish', confidence: 0.75, rationale: 'Avocados very sensitive to drought' },
    d4: { commodity: 'avocados', impact: 'bullish', confidence: 0.95, rationale: 'Critical water shortage for avocados' },
  },
  almonds: {
    none_d0: { commodity: 'almonds', impact: 'bearish', confidence: 0.4, rationale: 'Good irrigation for almond orchards' },
    d1: { commodity: 'almonds', impact: 'neutral', confidence: 0.3, rationale: 'Minor water allocation concerns' },
    d2_d3: { commodity: 'almonds', impact: 'bullish', confidence: 0.7, rationale: 'Water restrictions impact almond yields' },
    d4: { commodity: 'almonds', impact: 'bullish', confidence: 0.9, rationale: 'Severe water shortage threatens orchards' },
  },
  lettuce: {
    none_d0: { commodity: 'lettuce', impact: 'bearish', confidence: 0.45, rationale: 'Good conditions for leafy greens' },
    d1: { commodity: 'lettuce', impact: 'neutral', confidence: 0.3, rationale: 'Minor stress on lettuce crops' },
    d2_d3: { commodity: 'lettuce', impact: 'bullish', confidence: 0.7, rationale: 'Lettuce highly sensitive to drought' },
    d4: { commodity: 'lettuce', impact: 'bullish', confidence: 0.9, rationale: 'Severe lettuce crop losses' },
  },
};

export function getDroughtImpact(commodity: CommodityName, droughtLevel: DroughtLevel): WeatherImpact {
  const score = DROUGHT_SCORES[droughtLevel];
  const rules = DROUGHT_IMPACT_RULES[commodity];

  // Fallback for commodities without specific rules
  if (!rules) {
    const defaultImpact: WeatherImpact = {
      commodity,
      impact: score >= 3 ? 'bullish' : score >= 1 ? 'neutral' : 'bearish',
      confidence: 0.3,
      rationale: `Weather impact based on general drought conditions (${droughtLevel})`,
    };
    return defaultImpact;
  }

  if (score <= 1) return rules.none_d0;
  if (score === 2) return rules.d1;
  if (score <= 4) return rules.d2_d3;
  return rules.d4;
}

export function calculateWeatherScore(droughtLevel: DroughtLevel, precipAnomaly: number): number {
  // Negative score = good for shorts (bearish prices)
  // Positive score = bad for shorts (bullish prices)

  const droughtScore = DROUGHT_SCORES[droughtLevel];

  // Drought is bullish (positive score)
  // droughtScore ranges 0-5, normalize to 0-1 and weight heavily
  const droughtComponent = (droughtScore / 5) * 0.8;

  // Precipitation anomaly: negative = deficit (bullish), positive = surplus (bearish)
  // precipAnomaly is in percentage, e.g., -30 means 30% below normal
  // Deficit (negative) is bullish, surplus (positive) is bearish
  const precipComponent = (-precipAnomaly / 100) * 0.2;

  // Total score: positive = bullish (avoid short), negative = bearish (short opportunity)
  return droughtComponent + precipComponent;
}

export function interpretScore(score: number): { signal: 'short' | 'avoid_short' | 'neutral'; strength: number } {
  const absScore = Math.abs(score);

  if (score > 0.3) {
    // Bullish conditions (drought/deficit) - avoid shorting
    return { signal: 'avoid_short', strength: Math.min(absScore, 1) };
  } else if (score < -0.1) {
    // Bearish conditions (good weather) - short opportunity
    return { signal: 'short', strength: Math.min(absScore, 1) };
  }
  return { signal: 'neutral', strength: absScore };
}
