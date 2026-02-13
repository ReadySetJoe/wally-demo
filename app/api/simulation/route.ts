import { NextRequest, NextResponse } from 'next/server';
import { runBacktest } from '@/lib/simulation/backtest';
import { SimulationConfig, DEFAULT_CONFIG } from '@/types/simulation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const config: SimulationConfig = {
      initialCapital: body.initialCapital || DEFAULT_CONFIG.initialCapital,
      startDate: body.startDate || DEFAULT_CONFIG.startDate,
      endDate: body.endDate || DEFAULT_CONFIG.endDate,
      signalThreshold: body.signalThreshold ?? DEFAULT_CONFIG.signalThreshold,
      positionSize: body.positionSize ?? DEFAULT_CONFIG.positionSize,
      stopLoss: body.stopLoss ?? DEFAULT_CONFIG.stopLoss,
      takeProfit: body.takeProfit ?? DEFAULT_CONFIG.takeProfit,
    };

    const result = runBacktest(config);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation', status: 'error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Run with default config
  const result = runBacktest(DEFAULT_CONFIG);
  return NextResponse.json(result);
}
