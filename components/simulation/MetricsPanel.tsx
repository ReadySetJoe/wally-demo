'use client';

import { PerformanceMetrics, SimulationConfig } from '@/types/simulation';

interface MetricsPanelProps {
  metrics: PerformanceMetrics;
  config: SimulationConfig;
}

function MetricCard({
  label,
  value,
  subValue,
  color,
}: {
  label: string;
  value: string;
  subValue?: string;
  color?: 'green' | 'red' | 'neutral';
}) {
  const colorClass = color === 'green'
    ? 'text-green-600'
    : color === 'red'
    ? 'text-red-600'
    : 'text-gray-900';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-700 font-medium mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      {subValue && <div className="text-sm text-gray-600 mt-1">{subValue}</div>}
    </div>
  );
}

// Helper to safely format numbers
function fmt(value: number | null | undefined, decimals: number = 2): string {
  return (value ?? 0).toFixed(decimals);
}

export function MetricsPanel({ metrics, config }: MetricsPanelProps) {
  if (!metrics) {
    return <div className="bg-gray-50 rounded-xl p-4">No metrics available</div>;
  }

  const totalReturn = metrics.totalReturn ?? 0;
  const totalPnl = metrics.totalPnl ?? 0;
  const finalEquity = metrics.finalEquity ?? config.initialCapital;
  const maxDrawdown = metrics.maxDrawdown ?? 0;
  const maxDrawdownDollar = metrics.maxDrawdownDollar ?? 0;
  const sharpeRatio = metrics.sharpeRatio ?? 0;
  const winRate = metrics.winRate ?? 0;
  const avgTradeDuration = metrics.avgTradeDuration ?? 0;
  const avgWin = metrics.avgWin ?? 0;
  const avgLoss = metrics.avgLoss ?? 0;
  const profitFactor = metrics.profitFactor ?? 0;

  const returnColor = totalReturn >= 0 ? 'green' : 'red';

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <MetricCard
          label="Total Return"
          value={`${totalReturn >= 0 ? '+' : ''}${fmt(totalReturn)}%`}
          subValue={`$${fmt(totalPnl)}`}
          color={returnColor}
        />
        <MetricCard
          label="Final Equity"
          value={`$${finalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue={`Started: $${config.initialCapital.toLocaleString()}`}
        />
        <MetricCard
          label="Max Drawdown"
          value={`-${fmt(maxDrawdown)}%`}
          subValue={`$${fmt(maxDrawdownDollar)}`}
          color="red"
        />
        <MetricCard
          label="Sharpe Ratio"
          value={fmt(sharpeRatio)}
          subValue="Annualized"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <MetricCard
          label="Win Rate"
          value={`${fmt(winRate, 1)}%`}
          subValue={`${metrics.winningTrades ?? 0}W / ${metrics.losingTrades ?? 0}L`}
          color={winRate >= 50 ? 'green' : 'red'}
        />
        <MetricCard
          label="Total Trades"
          value={(metrics.totalTrades ?? 0).toString()}
          subValue={`Avg ${fmt(avgTradeDuration, 1)} days`}
        />
        <MetricCard
          label="Avg Win"
          value={`$${fmt(avgWin)}`}
          color="green"
        />
        <MetricCard
          label="Avg Loss"
          value={`-$${fmt(avgLoss)}`}
          color="red"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Profit Factor"
          value={profitFactor === Infinity ? '∞' : fmt(profitFactor)}
          subValue="Gross Profit / Gross Loss"
          color={profitFactor >= 1 ? 'green' : 'red'}
        />
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 font-medium mb-2">Best / Worst Trade</div>
          {metrics.bestTrade ? (
            <div className="text-sm">
              <span className="text-green-600 font-medium">
                +${fmt(metrics.bestTrade.pnl)}
              </span>
              <span className="text-gray-600 ml-2">
                {metrics.bestTrade.commodity} ({metrics.bestTrade.openDate})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No winning trades</div>
          )}
          {metrics.worstTrade ? (
            <div className="text-sm">
              <span className="text-red-600 font-medium">
                ${fmt(metrics.worstTrade.pnl)}
              </span>
              <span className="text-gray-600 ml-2">
                {metrics.worstTrade.commodity} ({metrics.worstTrade.openDate})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No losing trades</div>
          )}
        </div>
      </div>
    </div>
  );
}
