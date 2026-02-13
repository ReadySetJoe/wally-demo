import { NextResponse } from 'next/server';
import { fetchAllCommodityPrices } from '@/lib/api/yahoo-finance';

export async function GET() {
  try {
    const commodities = await fetchAllCommodityPrices();
    return NextResponse.json(commodities);
  } catch (error) {
    console.error('Commodities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commodity prices' },
      { status: 500 }
    );
  }
}
