'use client';

import { SimulationConfig } from '@/types/simulation';
import { CommodityName, CommodityCategory, COMMODITY_MAP, COMMODITY_SYMBOLS_BY_CATEGORY } from '@/types/commodity';

interface SimulationFormProps {
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
  onRun: () => void;
  loading: boolean;
}

const CATEGORY_LABELS: Record<CommodityCategory, string> = {
  grains: 'Grains (CME)',
  softs: 'Softs (ICE)',
  produce: 'Produce (Simulated)',
};

const ALL_COMMODITIES: CommodityName[] = [
  'corn', 'wheat', 'soybeans',
  'orange_juice', 'coffee', 'sugar', 'cotton', 'cocoa',
  'tomatoes', 'avocados', 'almonds', 'lettuce',
];

const CATEGORY_COMMODITIES: Record<CommodityCategory, CommodityName[]> = {
  grains: ['corn', 'wheat', 'soybeans'],
  softs: ['orange_juice', 'coffee', 'sugar', 'cotton', 'cocoa'],
  produce: ['tomatoes', 'avocados', 'almonds', 'lettuce'],
};

export function SimulationForm({ config, onChange, onRun, loading }: SimulationFormProps) {
  const updateConfig = (key: keyof SimulationConfig, value: number | string | CommodityName[]) => {
    onChange({ ...config, [key]: value });
  };

  const selectedCommodities = config.commodities || ALL_COMMODITIES;

  const toggleCommodity = (commodity: CommodityName) => {
    const isSelected = selectedCommodities.includes(commodity);
    const newCommodities = isSelected
      ? selectedCommodities.filter(c => c !== commodity)
      : [...selectedCommodities, commodity];
    updateConfig('commodities', newCommodities.length > 0 ? newCommodities : ALL_COMMODITIES);
  };

  const toggleCategory = (category: CommodityCategory) => {
    const categoryCommodities = CATEGORY_COMMODITIES[category];
    const allSelected = categoryCommodities.every(c => selectedCommodities.includes(c));

    let newCommodities: CommodityName[];
    if (allSelected) {
      // Remove all from category
      newCommodities = selectedCommodities.filter(c => !categoryCommodities.includes(c));
    } else {
      // Add all from category
      newCommodities = [...new Set([...selectedCommodities, ...categoryCommodities])];
    }
    updateConfig('commodities', newCommodities.length > 0 ? newCommodities : ALL_COMMODITIES);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Simulation Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Initial Capital
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">$</span>
            <input
              type="number"
              min="1000"
              step="1000"
              value={config.initialCapital}
              onChange={(e) => updateConfig('initialCapital', Number(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => updateConfig('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => updateConfig('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Commodities ({selectedCommodities.length} selected)
          </label>
          <div className="space-y-2">
            {(['grains', 'softs', 'produce'] as CommodityCategory[]).map(category => {
              const categoryCommodities = CATEGORY_COMMODITIES[category];
              const selectedInCategory = categoryCommodities.filter(c => selectedCommodities.includes(c)).length;
              const allSelected = selectedInCategory === categoryCommodities.length;

              return (
                <div key={category} className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{CATEGORY_LABELS[category]}</span>
                    </label>
                    <span className="text-xs text-gray-500">{selectedInCategory}/{categoryCommodities.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {categoryCommodities.map(commodity => (
                      <button
                        key={commodity}
                        type="button"
                        onClick={() => toggleCommodity(commodity)}
                        className={`text-xs px-2 py-0.5 rounded transition-colors ${
                          selectedCommodities.includes(commodity)
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {commodity.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Signal Threshold: <span className="text-blue-600">{(config.signalThreshold * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.signalThreshold * 100}
            onChange={(e) => updateConfig('signalThreshold', Number(e.target.value) / 100)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Position Size: <span className="text-blue-600">{(config.positionSize * 100).toFixed(0)}%</span> of capital
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={config.positionSize * 100}
            onChange={(e) => updateConfig('positionSize', Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Stop Loss: <span className="text-red-600">{(config.stopLoss * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={config.stopLoss * 100}
              onChange={(e) => updateConfig('stopLoss', Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Take Profit: <span className="text-green-600">{(config.takeProfit * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={config.takeProfit * 100}
              onChange={(e) => updateConfig('takeProfit', Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={onRun}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Signal Threshold:</strong> Only trade when signal strength exceeds this value</p>
          <p><strong>Position Size:</strong> Amount of capital to allocate per trade</p>
          <p><strong>Stop Loss:</strong> Exit losing trades at this % loss</p>
          <p><strong>Take Profit:</strong> Exit winning trades at this % gain</p>
        </div>
      </div>
    </div>
  );
}
