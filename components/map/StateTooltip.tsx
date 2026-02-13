'use client';

import { StateSignal } from '@/types/signal';

interface StateTooltipProps {
  stateCode: string;
  signal: StateSignal;
  position: { x: number; y: number };
}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

export function StateTooltip({ stateCode, signal, position }: StateTooltipProps) {
  const stateName = STATE_NAMES[stateCode] || stateCode;

  const getSignalBadge = () => {
    switch (signal.dominantSignal) {
      case 'short':
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">SHORT</span>;
      case 'avoid_short':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">AVOID SHORT</span>;
      default:
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">NEUTRAL</span>;
    }
  };

  if (signal.signals.length === 0) {
    return (
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
        style={{
          left: position.x + 10,
          top: position.y + 10,
          maxWidth: '280px',
        }}
      >
        <div className="font-semibold text-gray-900">{stateName}</div>
        <div className="text-sm text-gray-500 mt-1">No agricultural region data</div>
      </div>
    );
  }

  const primarySignal = signal.signals[0];

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        maxWidth: '300px',
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-semibold text-gray-900">{stateName}</span>
        {getSignalBadge()}
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Region:</span>
          <span className="text-gray-900 font-medium">{primarySignal.region}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Commodity:</span>
          <span className="text-gray-900 capitalize">{primarySignal.commodity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Drought Level:</span>
          <span className="text-gray-900">{primarySignal.weatherFactors.droughtLevel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Precip Anomaly:</span>
          <span className={primarySignal.weatherFactors.precipAnomaly >= 0 ? 'text-blue-600' : 'text-orange-600'}>
            {primarySignal.weatherFactors.precipAnomaly > 0 ? '+' : ''}
            {primarySignal.weatherFactors.precipAnomaly}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Signal Strength:</span>
          <span className="text-gray-900">{(primarySignal.strength * 100).toFixed(0)}%</span>
        </div>
      </div>

      {primarySignal.rationale.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 italic">
            {primarySignal.rationale[0]}
          </div>
        </div>
      )}
    </div>
  );
}
