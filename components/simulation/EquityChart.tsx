'use client';

import { DailySnapshot } from '@/types/simulation';

interface EquityChartProps {
  snapshots: DailySnapshot[];
  initialCapital: number;
}

export function EquityChart({ snapshots, initialCapital }: EquityChartProps) {
  if (snapshots.length === 0) return null;

  const maxEquity = Math.max(...snapshots.map(s => s.equity));
  const minEquity = Math.min(...snapshots.map(s => s.equity));
  const range = maxEquity - minEquity || 1;

  const width = 100;
  const height = 40;
  const padding = 2;

  // Create SVG path for equity curve
  const points = snapshots.map((snapshot, i) => {
    const x = (i / (snapshots.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((snapshot.equity - minEquity) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Create area fill path
  const areaD = `M ${padding},${height - padding} L ${points.join(' L ')} L ${width - padding},${height - padding} Z`;

  // Determine color based on final performance
  const finalEquity = snapshots[snapshots.length - 1].equity;
  const isPositive = finalEquity >= initialCapital;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const fillColor = isPositive ? '#22c55e20' : '#ef444420';

  // Calculate key stats
  const firstDate = snapshots[0].date;
  const lastDate = snapshots[snapshots.length - 1].date;
  const peakEquity = Math.max(...snapshots.map(s => s.equity));
  const peakDate = snapshots.find(s => s.equity === peakEquity)?.date;
  const troughEquity = Math.min(...snapshots.map(s => s.equity));
  const troughDate = snapshots.find(s => s.equity === troughEquity)?.date;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Equity Curve</h2>

      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-20 flex flex-col justify-between text-sm text-gray-700 font-medium">
          <span>${maxEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span>${((maxEquity + minEquity) / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span>${minEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>

        {/* Chart */}
        <div className="ml-20">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-64"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="0.2" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e7eb" strokeWidth="0.2" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="0.2" />

            {/* Initial capital reference line */}
            {initialCapital >= minEquity && initialCapital <= maxEquity && (
              <line
                x1={padding}
                y1={height - padding - ((initialCapital - minEquity) / range) * (height - padding * 2)}
                x2={width - padding}
                y2={height - padding - ((initialCapital - minEquity) / range) * (height - padding * 2)}
                stroke="#6b7280"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
            )}

            {/* Area fill */}
            <path d={areaD} fill={fillColor} />

            {/* Line */}
            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="0.5" />
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between text-sm text-gray-700 font-medium mt-2">
            <span>{firstDate}</span>
            <span>{lastDate}</span>
          </div>
        </div>
      </div>

      {/* Stats below chart */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-600 font-medium">Start</div>
          <div className="font-bold text-gray-900">${initialCapital.toLocaleString()}</div>
          <div className="text-gray-600">{firstDate}</div>
        </div>
        <div>
          <div className="text-gray-600 font-medium">Peak</div>
          <div className="font-bold text-green-600">${peakEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div className="text-gray-600">{peakDate}</div>
        </div>
        <div>
          <div className="text-gray-600 font-medium">Trough</div>
          <div className="font-bold text-red-600">${troughEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div className="text-gray-600">{troughDate}</div>
        </div>
        <div>
          <div className="text-gray-600 font-medium">Final</div>
          <div className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            ${finalEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="text-gray-600">{lastDate}</div>
        </div>
      </div>
    </div>
  );
}
