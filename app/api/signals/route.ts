import { NextResponse } from 'next/server';
import { fetchDroughtData } from '@/lib/api/drought-monitor';
import { fetchAllCommodityPrices } from '@/lib/api/yahoo-finance';
import { getGeopoliticalSummary } from '@/lib/api/news';
import { generateSignals, generateSignalSummary, generateStateSignals } from '@/lib/analysis/signals';

export async function GET() {
  try {
    // Fetch data in parallel
    const [droughtData, commodityPrices, geopoliticalSummary] = await Promise.all([
      fetchDroughtData(),
      fetchAllCommodityPrices(),
      getGeopoliticalSummary(),
    ]);

    // Generate signals (incorporating geopolitical risk)
    const signals = generateSignals(droughtData, commodityPrices, geopoliticalSummary.commodityRisks);
    const summary = generateSignalSummary(signals);
    const stateSignals = generateStateSignals(droughtData, signals);

    return NextResponse.json({
      summary,
      stateSignals,
      droughtData,
      commodityPrices,
      geopoliticalSummary,
    });
  } catch (error) {
    console.error('Signals API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signals' },
      { status: 500 }
    );
  }
}
