'use client';

import { ShortSellSignal, SignalSummary } from '@/types/signal';

interface SignalPanelProps {
  summary: SignalSummary;
}

function SignalCard({ signal }: { signal: ShortSellSignal }) {
  const getBorderColor = () => {
    switch (signal.signalType) {
      case 'short': return 'border-l-green-500';
      case 'avoid_short': return 'border-l-red-500';
      default: return 'border-l-yellow-500';
    }
  };

  const getSignalLabel = () => {
    switch (signal.signalType) {
      case 'short': return { text: 'SHORT', bg: 'bg-green-100', color: 'text-green-800' };
      case 'avoid_short': return { text: 'AVOID', bg: 'bg-red-100', color: 'text-red-800' };
      default: return { text: 'HOLD', bg: 'bg-yellow-100', color: 'text-yellow-800' };
    }
  };

  const label = getSignalLabel();

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${getBorderColor()} rounded-lg p-3 shadow-sm`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900">{signal.region}</div>
          <div className="text-sm text-gray-500 capitalize">{signal.commodity}</div>
        </div>
        <span className={`px-2 py-0.5 ${label.bg} ${label.color} text-xs font-bold rounded`}>
          {label.text}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        <div>
          <span className="text-gray-500">Drought:</span>
          <span className="ml-1 text-gray-900">{signal.weatherFactors.droughtLevel}</span>
        </div>
        <div>
          <span className="text-gray-500">Strength:</span>
          <span className="ml-1 text-gray-900">{(signal.strength * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-500">Price:</span>
          <span className="ml-1 text-gray-900">${signal.priceFactors.currentPrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-500">Precip:</span>
          <span className={`ml-1 ${signal.weatherFactors.precipAnomaly >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {signal.weatherFactors.precipAnomaly > 0 ? '+' : ''}{signal.weatherFactors.precipAnomaly}%
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">
        {signal.rationale[0]}
      </div>
    </div>
  );
}

export function SignalPanel({ summary }: SignalPanelProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Trading Signals</h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{summary.shortOpportunities}</div>
          <div className="text-xs text-gray-500">Short Opportunities</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{summary.avoidShort}</div>
          <div className="text-xs text-gray-500">Avoid Shorting</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{summary.neutral}</div>
          <div className="text-xs text-gray-500">Neutral</div>
        </div>
      </div>

      <div className="space-y-3">
        {summary.signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-400 text-center">
        Last updated: {new Date(summary.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
