'use client';

import { StateWeatherSummary } from '@/lib/api/noaa';

interface WeatherSummaryProps {
  summaries: StateWeatherSummary[];
  dataSource: 'noaa' | 'simulated';
}

function RiskBadge({ risk }: { risk: StateWeatherSummary['weatherRisk'] }) {
  const colors = {
    low: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    extreme: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${colors[risk]}`}>
      {risk}
    </span>
  );
}

function WeatherCard({ summary }: { summary: StateWeatherSummary }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900">{summary.stateCode}</div>
          <div className="text-xs text-gray-500">{summary.stateName}</div>
        </div>
        <RiskBadge risk={summary.weatherRisk} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-gray-600">Temp</div>
          <div className="font-medium text-gray-900">
            {summary.currentTemp}°F
            <span className={`text-xs ml-1 ${summary.tempAnomaly >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
              ({summary.tempAnomaly >= 0 ? '+' : ''}{summary.tempAnomaly}°)
            </span>
          </div>
        </div>
        <div>
          <div className="text-gray-600">7d Precip</div>
          <div className="font-medium text-gray-900">
            {summary.last7DaysPrecip}"
            <span className={`text-xs ml-1 ${summary.precipAnomaly >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ({summary.precipAnomaly >= 0 ? '+' : ''}{summary.precipAnomaly}%)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Heat:</span>
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-red-500"
                style={{ width: `${summary.heatIndex}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Moisture:</span>
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-blue-500"
                style={{ width: `${summary.moistureIndex}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeatherSummary({ summaries, dataSource }: WeatherSummaryProps) {
  const extremeCount = summaries.filter(s => s.weatherRisk === 'extreme').length;
  const highCount = summaries.filter(s => s.weatherRisk === 'high').length;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Weather Conditions</h2>
        <div className="flex items-center gap-2">
          {extremeCount > 0 && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              {extremeCount} Extreme
            </span>
          )}
          {highCount > 0 && (
            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
              {highCount} High Risk
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {summaries.slice(0, 12).map(summary => (
          <WeatherCard key={summary.stateCode} summary={summary} />
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        {dataSource === 'noaa' ? (
          <span>Live data from NOAA Climate Data Online</span>
        ) : (
          <span>Simulated weather data. Add NOAA_API_TOKEN for live data.</span>
        )}
      </div>
    </div>
  );
}
