import { NextResponse } from 'next/server';
import { getGeopoliticalSummary } from '@/lib/api/news';

export async function GET() {
  try {
    const summary = await getGeopoliticalSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Geopolitical API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geopolitical data' },
      { status: 500 }
    );
  }
}
