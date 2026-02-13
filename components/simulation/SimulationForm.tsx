'use client';

import { SimulationConfig } from '@/types/simulation';

interface SimulationFormProps {
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
  onRun: () => void;
  loading: boolean;
}

export function SimulationForm({ config, onChange, onRun, loading }: SimulationFormProps) {
  const updateConfig = (key: keyof SimulationConfig, value: number | string) => {
    onChange({ ...config, [key]: value });
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
