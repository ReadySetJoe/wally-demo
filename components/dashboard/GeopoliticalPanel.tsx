'use client';

import { GeopoliticalSummary, GeopoliticalEvent, EventCategory } from '@/types/geopolitical';

interface GeopoliticalPanelProps {
  summary: GeopoliticalSummary;
}

const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string }> = {
  trade: { bg: 'bg-blue-100', text: 'text-blue-800' },
  conflict: { bg: 'bg-red-100', text: 'text-red-800' },
  sanctions: { bg: 'bg-orange-100', text: 'text-orange-800' },
  policy: { bg: 'bg-purple-100', text: 'text-purple-800' },
  weather: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  supply: { bg: 'bg-green-100', text: 'text-green-800' },
};

const CATEGORY_ICONS: Record<EventCategory, string> = {
  trade: '📊',
  conflict: '⚔️',
  sanctions: '🚫',
  policy: '📜',
  weather: '🌧️',
  supply: '📦',
};

function EventCard({ event }: { event: GeopoliticalEvent }) {
  const colors = CATEGORY_COLORS[event.category];
  const icon = CATEGORY_ICONS[event.category];

  const impactColor = event.impactScore > 0.1
    ? 'text-red-600'
    : event.impactScore < -0.1
    ? 'text-green-600'
    : 'text-gray-500';

  const impactLabel = event.impactScore > 0.1
    ? 'Bullish'
    : event.impactScore < -0.1
    ? 'Bearish'
    : 'Neutral';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-900 text-sm hover:text-blue-600 line-clamp-2"
          >
            {event.title}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}>
          {event.category}
        </span>
        <span className="text-xs text-gray-500">{event.region}</span>
        <span className={`text-xs font-medium ${impactColor}`}>
          {impactLabel}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <span>{event.source}</span>
        <span>•</span>
        <span>{new Date(event.publishedAt).toLocaleDateString()}</span>
      </div>

      <div className="mt-2 flex gap-1 flex-wrap">
        {event.affectedCommodities.map(c => (
          <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded capitalize">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function RiskMeter({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color = value > 0.6 ? 'bg-red-500' : value > 0.3 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-16">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-8">{percentage}%</span>
    </div>
  );
}

export function GeopoliticalPanel({ summary }: GeopoliticalPanelProps) {
  const riskLevel = summary.overallMarketRisk > 0.6
    ? { label: 'High', color: 'text-red-600', bg: 'bg-red-100' }
    : summary.overallMarketRisk > 0.3
    ? { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    : { label: 'Low', color: 'text-green-600', bg: 'bg-green-100' };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Geopolitical Risk</h2>
        <span className={`px-2 py-1 text-xs font-bold rounded ${riskLevel.bg} ${riskLevel.color}`}>
          {riskLevel.label} Risk
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Risk by Commodity</div>
        <div className="space-y-2">
          {summary.commodityRisks.map(risk => (
            <div key={risk.commodity} className="flex items-center justify-between">
              <span className="text-sm capitalize text-gray-600">{risk.commodity}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      risk.overallRisk > 0.6 ? 'bg-red-500' :
                      risk.overallRisk > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${risk.overallRisk * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-16 text-right ${
                  risk.signalImpact === 'bullish' ? 'text-red-600' :
                  risk.signalImpact === 'bearish' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {risk.signalImpact === 'bullish' ? '↑ Bullish' :
                   risk.signalImpact === 'bearish' ? '↓ Bearish' : '— Neutral'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Risk Factors</div>
        <div className="space-y-2">
          <RiskMeter label="Trade" value={summary.commodityRisks.reduce((s, r) => s + r.riskFactors.trade, 0) / 3} />
          <RiskMeter label="Conflict" value={summary.commodityRisks.reduce((s, r) => s + r.riskFactors.conflict, 0) / 3} />
          <RiskMeter label="Sanctions" value={summary.commodityRisks.reduce((s, r) => s + r.riskFactors.sanctions, 0) / 3} />
          <RiskMeter label="Policy" value={summary.commodityRisks.reduce((s, r) => s + r.riskFactors.policy, 0) / 3} />
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Recent Events</div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {summary.recentEvents.slice(0, 5).map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-400 text-center">
        Data from GDELT Project • Updated: {new Date(summary.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
