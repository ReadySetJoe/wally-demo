import { NextResponse } from 'next/server';
import { fetchDroughtData } from '@/lib/api/drought-monitor';

export async function GET() {
  try {
    const droughtData = await fetchDroughtData();
    return NextResponse.json(droughtData);
  } catch (error) {
    console.error('Drought API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drought data' },
      { status: 500 }
    );
  }
}
