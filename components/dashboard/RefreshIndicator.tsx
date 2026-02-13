'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshIndicatorProps {
  lastUpdated?: string;
  refreshInterval?: number; // in seconds
}

export function RefreshIndicator({
  lastUpdated,
  refreshInterval = 300, // 5 minutes default
}: RefreshIndicatorProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(refreshInterval);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    router.refresh();
    // Give time for the refresh to complete
    setTimeout(() => {
      setIsRefreshing(false);
      setCountdown(refreshInterval);
    }, 1000);
  }, [router, refreshInterval]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, handleRefresh]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastUpdated = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Last updated:</span>
        <span className="font-medium text-gray-700">{formatLastUpdated(lastUpdated)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isRefreshing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {isRefreshing ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Refreshing...
            </span>
          ) : (
            'Refresh'
          )}
        </button>

        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-gray-600">Auto</span>
        </label>

        {autoRefresh && (
          <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
            {formatTime(countdown)}
          </span>
        )}
      </div>
    </div>
  );
}
