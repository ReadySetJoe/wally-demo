'use client';

import { useState } from 'react';
import { SimulationConfig, SimulationResult, DEFAULT_CONFIG } from '@/types/simulation';
import { SimulationForm } from '@/components/simulation/SimulationForm';
import { EquityChart } from '@/components/simulation/EquityChart';
import { MetricsPanel } from '@/components/simulation/MetricsPanel';
import { TradeHistory } from '@/components/simulation/TradeHistory';

export default function SimulationPage() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Backtest Simulation
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Test trading signals against historical data
              </p>
            </div>
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SimulationForm
              config={config}
              onChange={setConfig}
              onRun={runSimulation}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="text-red-800 font-medium">Error</div>
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}

            {!result && !loading && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <div className="text-gray-600 text-lg font-medium">
                  Configure and run a simulation
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Set your parameters on the left and click "Run Simulation" to see results
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <div className="text-gray-600">Running simulation...</div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                <MetricsPanel metrics={result.metrics} config={result.config} />
                <EquityChart snapshots={result.dailySnapshots} initialCapital={result.config.initialCapital} />
                <TradeHistory trades={result.trades} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 text-xl">&#9888;</div>
            <div>
              <div className="font-semibold text-amber-800">Simulation Disclaimer</div>
              <p className="text-sm text-amber-700 mt-1">
                This backtest uses synthetic historical data for demonstration purposes.
                Past performance does not guarantee future results. Real market conditions
                involve slippage, commissions, and other factors not modeled here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
