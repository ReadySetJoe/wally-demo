import { CommodityName } from './commodity';
import { SignalType } from './signal';

export interface SimulationConfig {
  initialCapital: number;
  startDate: string;
  endDate: string;
  signalThreshold: number; // 0-1, only execute trades above this strength
  positionSize: number; // % of capital per trade (e.g., 0.1 = 10%)
  stopLoss: number; // % loss to exit (e.g., 0.05 = 5%)
  takeProfit: number; // % gain to exit (e.g., 0.1 = 10%)
  commodities?: CommodityName[]; // Optional: which commodities to trade (defaults to all)
}

export interface Trade {
  id: string;
  openDate: string;
  closeDate: string | null;
  commodity: CommodityName;
  direction: 'short' | 'long';
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  signalStrength: number;
  pnl: number | null;
  pnlPercent: number | null;
  status: 'open' | 'closed' | 'stopped';
  exitReason: 'signal' | 'stop_loss' | 'take_profit' | 'end_of_sim' | null;
}

export interface DailySnapshot {
  date: string;
  equity: number;
  cash: number;
  openPositions: number;
  dayPnl: number;
  totalPnl: number;
  drawdown: number;
  signals: {
    commodity: CommodityName;
    signalType: SignalType;
    strength: number;
  }[];
}

export interface SimulationResult {
  config: SimulationConfig;
  trades: Trade[];
  dailySnapshots: DailySnapshot[];
  metrics: PerformanceMetrics;
  status: 'completed' | 'running' | 'error';
  error?: string;
}

export interface PerformanceMetrics {
  totalReturn: number; // %
  totalPnl: number; // $
  finalEquity: number;
  maxDrawdown: number; // %
  maxDrawdownDollar: number;
  sharpeRatio: number;
  winRate: number; // %
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number; // $
  avgLoss: number; // $
  profitFactor: number; // gross profit / gross loss
  avgTradeDuration: number; // days
  bestTrade: Trade | null;
  worstTrade: Trade | null;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  initialCapital: 100000,
  startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months ago
  endDate: new Date().toISOString().split('T')[0],
  signalThreshold: 0.4,
  positionSize: 0.1,
  stopLoss: 0.05,
  takeProfit: 0.1,
};
