'use client';

import { useState } from 'react';
import { Trade } from '@/types/simulation';

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'commodity'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'winners' | 'losers'>('all');

  const filteredTrades = trades.filter(t => {
    if (filter === 'winners') return (t.pnl || 0) > 0;
    if (filter === 'losers') return (t.pnl || 0) < 0;
    return true;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.openDate).getTime() - new Date(b.openDate).getTime();
    } else if (sortBy === 'pnl') {
      comparison = (a.pnl || 0) - (b.pnl || 0);
    } else if (sortBy === 'commodity') {
      comparison = a.commodity.localeCompare(b.commodity);
    }
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (column: 'date' | 'pnl' | 'commodity') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }: { column: 'date' | 'pnl' | 'commodity' }) => {
    if (sortBy !== column) return <span className="text-gray-400">↕</span>;
    return <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Trade History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({trades.length})
          </button>
          <button
            onClick={() => setFilter('winners')}
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              filter === 'winners'
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Winners ({trades.filter(t => (t.pnl || 0) > 0).length})
          </button>
          <button
            onClick={() => setFilter('losers')}
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              filter === 'losers'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Losers ({trades.filter(t => (t.pnl || 0) < 0).length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                onClick={() => toggleSort('date')}
                className="text-left py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                Date <SortIcon column="date" />
              </th>
              <th
                onClick={() => toggleSort('commodity')}
                className="text-left py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                Commodity <SortIcon column="commodity" />
              </th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Direction</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Entry</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Exit</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Qty</th>
              <th
                onClick={() => toggleSort('pnl')}
                className="text-right py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                P&L <SortIcon column="pnl" />
              </th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Exit Reason</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map(trade => (
              <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 text-gray-900">
                  <div>{trade.openDate}</div>
                  {trade.closeDate && (
                    <div className="text-gray-600">→ {trade.closeDate}</div>
                  )}
                </td>
                <td className="py-2 px-3 capitalize text-gray-900 font-medium">{trade.commodity}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    trade.direction === 'short'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {trade.direction.toUpperCase()}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono text-gray-900">
                  ${trade.entryPrice.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-gray-900">
                  {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                </td>
                <td className="py-2 px-3 text-right text-gray-900">{trade.quantity}</td>
                <td className={`py-2 px-3 text-right font-bold ${
                  (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trade.pnl !== null ? (
                    <>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      <div className="text-xs font-medium">
                        ({trade.pnlPercent! >= 0 ? '+' : ''}{trade.pnlPercent?.toFixed(2)}%)
                      </div>
                    </>
                  ) : '-'}
                </td>
                <td className="py-2 px-3">
                  <span className={`text-sm font-medium ${
                    trade.exitReason === 'take_profit' ? 'text-green-600' :
                    trade.exitReason === 'stop_loss' ? 'text-red-600' :
                    'text-gray-700'
                  }`}>
                    {trade.exitReason?.replace('_', ' ') || '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedTrades.length === 0 && (
        <div className="text-center py-8 text-gray-600 font-medium">
          No trades match the current filter
        </div>
      )}
    </div>
  );
}
