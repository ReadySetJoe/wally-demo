'use client';

import { CommodityPrice, CommodityCategory } from '@/types/commodity';

interface CommodityTickerProps {
  commodities: CommodityPrice[];
}

function CommodityCard({ commodity }: { commodity: CommodityPrice }) {
  const change = commodity.change ?? 0;
  const changePercent = commodity.changePercent ?? 0;
  const isPositive = change >= 0;

  return (
    <div className={`bg-white border rounded-lg p-3 shadow-sm ${commodity.isSimulated ? 'border-dashed border-gray-300' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="font-semibold text-gray-900 text-sm">{commodity.displayName}</div>
          <div className="text-xs text-gray-500">{commodity.symbol}</div>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>

      <div className="text-xl font-bold text-gray-900 mb-1">
        ${(commodity.price ?? 0).toFixed(2)}
      </div>

      <div className="flex justify-between text-xs">
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '+' : ''}{change.toFixed(2)}
        </span>
        <span className="text-gray-500">
          Vol: {(commodity.volume ?? 0).toLocaleString()}
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>H: ${(commodity.dayHigh ?? 0).toFixed(2)}</span>
        <span>L: ${(commodity.dayLow ?? 0).toFixed(2)}</span>
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<CommodityCategory, string> = {
  grains: 'Grains (CME)',
  softs: 'Softs (ICE)',
  produce: 'Produce (Simulated)',
};

const CATEGORY_ORDER: CommodityCategory[] = ['grains', 'softs', 'produce'];

export function CommodityTicker({ commodities }: CommodityTickerProps) {
  const groupedCommodities = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = commodities.filter(c => c.category === category);
    return acc;
  }, {} as Record<CommodityCategory, CommodityPrice[]>);

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Commodity Prices</h2>

      {CATEGORY_ORDER.map(category => {
        const items = groupedCommodities[category];
        if (!items || items.length === 0) return null;

        return (
          <div key={category} className="mb-4 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{CATEGORY_LABELS[category]}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {items.map((commodity) => (
                <CommodityCard key={commodity.symbol} commodity={commodity} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-3 text-xs text-gray-500 text-center">
        Real futures data from Yahoo Finance. Produce prices are simulated. Prices may be delayed.
      </div>
    </div>
  );
}
