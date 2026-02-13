import { NextResponse } from 'next/server';
import { fetchDroughtData } from '@/lib/api/drought-monitor';
import { generateWeatherSummary, fetchNOAAWeather, StateWeatherSummary } from '@/lib/api/noaa';
import { AGRICULTURAL_REGIONS } from '@/lib/data/agricultural-regions';

export async function GET() {
  try {
    // Get drought data
    const droughtData = await fetchDroughtData();

    // Get unique agricultural states
    const agriculturalStates = new Set<string>();
    for (const region of AGRICULTURAL_REGIONS) {
      for (const state of region.states) {
        agriculturalStates.add(state);
      }
    }

    // Generate weather summaries for agricultural states
    const summaries: StateWeatherSummary[] = [];

    for (const drought of droughtData) {
      if (!agriculturalStates.has(drought.stateCode)) continue;

      // Try to get real NOAA data (will return null if no API key)
      const noaaData = await fetchNOAAWeather(drought.stateCode);

      const summary = generateWeatherSummary(
        drought.stateCode,
        drought.stateName,
        drought.dominantLevel,
        noaaData
      );

      summaries.push(summary);
    }

    // Sort by weather risk (highest first)
    const riskOrder = { extreme: 0, high: 1, moderate: 2, low: 3 };
    summaries.sort((a, b) => riskOrder[a.weatherRisk] - riskOrder[b.weatherRisk]);

    return NextResponse.json({
      summaries,
      dataSource: process.env.NOAA_API_TOKEN ? 'noaa' : 'simulated',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
