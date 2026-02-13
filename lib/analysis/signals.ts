import { CommodityPrice, CommodityName } from '@/types/commodity';
import { DroughtData, DroughtLevel } from '@/types/weather';
import { ShortSellSignal, SignalSummary, StateSignal } from '@/types/signal';
import { GeopoliticalRisk } from '@/types/geopolitical';
import { AGRICULTURAL_REGIONS } from '@/lib/data/agricultural-regions';
import { getDroughtImpact, calculateWeatherScore, interpretScore } from './weather-impact';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function aggregateRegionDrought(droughtData: DroughtData[], states: string[]): { level: DroughtLevel; score: number } {
  const regionDrought = droughtData.filter(d => states.includes(d.stateCode));
  if (regionDrought.length === 0) {
    return { level: 'None', score: 0 };
  }

  // Calculate weighted average based on drought severity
  const droughtScores: Record<DroughtLevel, number> = {
    'None': 0, 'D0': 1, 'D1': 2, 'D2': 3, 'D3': 4, 'D4': 5,
  };

  const avgScore = regionDrought.reduce((sum, d) => sum + droughtScores[d.dominantLevel], 0) / regionDrought.length;

  // Convert back to level
  const levels: DroughtLevel[] = ['None', 'D0', 'D1', 'D2', 'D3', 'D4'];
  const levelIndex = Math.min(Math.round(avgScore), 5);

  return { level: levels[levelIndex], score: avgScore };
}

// Generate mock precipitation anomaly for demo
function getMockPrecipAnomaly(droughtScore: number): number {
  // Higher drought = more negative (deficit)
  // Base: slight positive correlation with drought
  const base = -droughtScore * 8;
  const noise = (Math.random() - 0.5) * 10;
  return Math.round(base + noise);
}

export function generateSignals(
  droughtData: DroughtData[],
  commodityPrices: CommodityPrice[],
  geopoliticalRisks?: GeopoliticalRisk[]
): ShortSellSignal[] {
  const signals: ShortSellSignal[] = [];

  for (const region of AGRICULTURAL_REGIONS) {
    const { level: droughtLevel, score: droughtScore } = aggregateRegionDrought(droughtData, region.states);
    const precipAnomaly = getMockPrecipAnomaly(droughtScore);
    const weatherScore = calculateWeatherScore(droughtLevel, precipAnomaly);

    // Get geopolitical risk for this commodity
    const geoRisk = geopoliticalRisks?.find(r => r.commodity === region.primaryCommodity);
    const geoAdjustment = geoRisk ? calculateGeoAdjustment(geoRisk) : 0;

    // Combine weather and geopolitical scores
    const combinedScore = weatherScore + geoAdjustment;
    const { signal: signalType, strength } = interpretScore(combinedScore);

    // Get price data for the commodity
    const priceData = commodityPrices.find(p => p.name === region.primaryCommodity);
    const impact = getDroughtImpact(region.primaryCommodity, droughtLevel);

    const rationale: string[] = [];
    if (signalType === 'short') {
      rationale.push(`${region.name} shows favorable growing conditions`);
      rationale.push(`Drought level: ${droughtLevel} - ${impact.rationale}`);
      rationale.push('Increased supply likely to pressure prices');
    } else if (signalType === 'avoid_short') {
      rationale.push(`${region.name} facing weather stress`);
      rationale.push(`Drought level: ${droughtLevel} - ${impact.rationale}`);
      rationale.push('Supply concerns support higher prices');
    } else {
      rationale.push(`${region.name} conditions are mixed`);
      rationale.push(`Drought level: ${droughtLevel}`);
      rationale.push('No clear directional signal');
    }

    if (precipAnomaly !== 0) {
      const precipDesc = precipAnomaly > 0 ? `+${precipAnomaly}% above` : `${precipAnomaly}% below`;
      rationale.push(`Precipitation: ${precipDesc} normal`);
    }

    // Add geopolitical context to rationale
    if (geoRisk && geoRisk.overallRisk > 0.3) {
      if (geoRisk.signalImpact === 'bullish') {
        rationale.push(`⚠️ Geopolitical risk: ${geoRisk.topEvents[0]?.title || 'Elevated tensions'}`);
      } else if (geoRisk.signalImpact === 'bearish') {
        rationale.push(`📉 Geopolitical tailwind: Favorable trade conditions`);
      }
    }

    signals.push({
      id: generateId(),
      region: region.name,
      states: region.states,
      commodity: region.primaryCommodity,
      signalType,
      strength,
      weatherFactors: {
        droughtLevel,
        droughtScore,
        precipAnomaly,
        tempAnomaly: 0,
      },
      priceFactors: {
        currentPrice: priceData?.price || 0,
        thirtyDayChange: priceData?.changePercent || 0,
      },
      rationale,
      updatedAt: new Date().toISOString(),
    });
  }

  return signals.sort((a, b) => b.strength - a.strength);
}

// Calculate geopolitical adjustment to signal
function calculateGeoAdjustment(geoRisk: GeopoliticalRisk): number {
  // Bullish geopolitical risk (supply disruption) = positive adjustment (avoid short)
  // Bearish geopolitical sentiment (stable supply) = negative adjustment (short opportunity)
  if (geoRisk.signalImpact === 'bullish') {
    return geoRisk.overallRisk * 0.3; // Up to 0.3 adjustment for high risk
  } else if (geoRisk.signalImpact === 'bearish') {
    return -geoRisk.overallRisk * 0.2; // Up to -0.2 adjustment
  }
  return 0;
}

export function generateSignalSummary(signals: ShortSellSignal[]): SignalSummary {
  const shortOpportunities = signals.filter(s => s.signalType === 'short').length;
  const avoidShort = signals.filter(s => s.signalType === 'avoid_short').length;
  const neutral = signals.filter(s => s.signalType === 'neutral').length;

  return {
    totalSignals: signals.length,
    shortOpportunities,
    avoidShort,
    neutral,
    topSignal: signals[0] || null,
    signals,
    generatedAt: new Date().toISOString(),
  };
}

export function generateStateSignals(
  droughtData: DroughtData[],
  signals: ShortSellSignal[]
): StateSignal[] {
  const stateSignals: StateSignal[] = [];

  for (const drought of droughtData) {
    // Find all signals that include this state
    const stateSignalList = signals.filter(s => s.states.includes(drought.stateCode));

    if (stateSignalList.length === 0) {
      stateSignals.push({
        stateCode: drought.stateCode,
        signals: [],
        aggregateScore: 0,
        dominantSignal: 'neutral',
      });
      continue;
    }

    // Calculate aggregate score
    // Positive = avoid short (red), Negative = short opportunity (green)
    let totalScore = 0;
    for (const signal of stateSignalList) {
      if (signal.signalType === 'avoid_short') {
        totalScore += signal.strength;
      } else if (signal.signalType === 'short') {
        totalScore -= signal.strength;
      }
    }
    const avgScore = totalScore / stateSignalList.length;

    // Determine dominant signal
    let dominantSignal: 'short' | 'avoid_short' | 'neutral' = 'neutral';
    if (avgScore > 0.2) dominantSignal = 'avoid_short';
    else if (avgScore < -0.1) dominantSignal = 'short';

    stateSignals.push({
      stateCode: drought.stateCode,
      signals: stateSignalList,
      aggregateScore: avgScore,
      dominantSignal,
    });
  }

  return stateSignals;
}
