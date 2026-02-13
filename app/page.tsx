import { USMap } from '@/components/map/USMap';
import { SignalPanel } from '@/components/dashboard/SignalPanel';
import { CommodityTicker } from '@/components/dashboard/CommodityTicker';
import { GeopoliticalPanel } from '@/components/dashboard/GeopoliticalPanel';
import { SignalSummary } from '@/types/signal';
import { StateSignal } from '@/types/signal';
import { CommodityPrice } from '@/types/commodity';
import { GeopoliticalSummary } from '@/types/geopolitical';

interface SignalsResponse {
  summary: SignalSummary;
  stateSignals: StateSignal[];
  commodityPrices: CommodityPrice[];
  geopoliticalSummary: GeopoliticalSummary;
}

async function getSignals(): Promise<SignalsResponse> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/signals`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!res.ok) {
      throw new Error('Failed to fetch signals');
    }

    return res.json();
  } catch {
    // Return mock data if API fails during build
    return {
      summary: {
        totalSignals: 0,
        shortOpportunities: 0,
        avoidShort: 0,
        neutral: 0,
        topSignal: null,
        signals: [],
        generatedAt: new Date().toISOString(),
      },
      stateSignals: [],
      commodityPrices: [],
      geopoliticalSummary: {
        overallMarketRisk: 0,
        commodityRisks: [],
        recentEvents: [],
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}

export default async function Home() {
  const { summary, stateSignals, commodityPrices, geopoliticalSummary } = await getSignals();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Weather & Geopolitical Commodity Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Analyzing weather patterns and geopolitical events for agricultural commodity signals
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/simulation"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Run Backtest
              </a>
              <div className="text-right">
                <div className="text-xs text-gray-400">Demo Application</div>
                <div className="text-xs text-gray-500">CME Futures: Corn, Wheat, Soybeans</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <CommodityTicker commodities={commodityPrices} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                US Agricultural Regions - Signal Map
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Hover over states to see drought conditions and trading signals
              </p>
              <USMap stateSignals={stateSignals} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <SignalPanel summary={summary} />
          </div>
        </div>

        <div className="mb-6">
          <GeopoliticalPanel summary={geopoliticalSummary} />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 text-xl">&#9888;</div>
            <div>
              <div className="font-semibold text-amber-800">Disclaimer</div>
              <p className="text-sm text-amber-700 mt-1">
                This is a demonstration application for educational purposes only.
                The signals and analysis presented are based on simplified correlations
                and should not be used for actual trading decisions. Weather-commodity
                relationships are complex and influenced by many factors not captured here.
                Always consult professional financial advisors before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Data sources: US Drought Monitor, Yahoo Finance, GDELT News
            </div>
            <div>
              Built with Next.js + React
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
