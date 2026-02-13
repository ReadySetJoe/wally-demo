import {
  SimulationConfig,
  SimulationResult,
  Trade,
  DailySnapshot,
  PerformanceMetrics,
} from '@/types/simulation';
import { CommodityName } from '@/types/commodity';
import { SignalType } from '@/types/signal';

// Seeded random number generator for deterministic results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Simple mulberry32 PRNG
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// Create seed from config for deterministic results
function createSeed(config: SimulationConfig): number {
  const str = `${config.startDate}-${config.endDate}-${config.initialCapital}-${config.signalThreshold}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

let rng: SeededRandom;
let idCounter = 0;

function generateId(): string {
  idCounter++;
  return `trade-${idCounter.toString().padStart(4, '0')}`;
}

// Generate synthetic historical price data
function generateHistoricalPrices(
  commodity: CommodityName,
  startDate: Date,
  endDate: Date
): { date: string; price: number }[] {
  const basePrices: Record<CommodityName, number> = {
    // Grains (cents/bushel)
    corn: 450,
    wheat: 600,
    soybeans: 1100,
    // Softs
    orange_juice: 285,  // cents/lb
    coffee: 185,        // cents/lb
    sugar: 21,          // cents/lb
    cotton: 78,         // cents/lb
    cocoa: 5200,        // $/ton
    // Produce (simulated)
    tomatoes: 28,       // $/cwt
    avocados: 42,       // $/case
    almonds: 3.25,      // $/lb
    lettuce: 18,        // $/carton
  };

  const volatility: Record<CommodityName, number> = {
    corn: 0.02,
    wheat: 0.025,
    soybeans: 0.02,
    orange_juice: 0.03,
    coffee: 0.025,
    sugar: 0.02,
    cotton: 0.02,
    cocoa: 0.025,
    tomatoes: 0.04,
    avocados: 0.05,
    almonds: 0.025,
    lettuce: 0.04,
  };

  const prices: { date: string; price: number }[] = [];
  let currentPrice = basePrices[commodity];
  const vol = volatility[commodity];

  const current = new Date(startDate);
  while (current <= endDate) {
    // Skip weekends
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      // Random walk with mean reversion (using seeded RNG)
      const drift = (basePrices[commodity] - currentPrice) * 0.01;
      const shock = (rng.next() - 0.5) * 2 * vol * currentPrice;
      currentPrice = Math.max(currentPrice * 0.8, currentPrice + drift + shock);

      prices.push({
        date: current.toISOString().split('T')[0],
        price: Math.round(currentPrice * 100) / 100,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return prices;
}

// Generate synthetic historical signals based on "weather" patterns
function generateHistoricalSignals(
  startDate: Date,
  endDate: Date,
  selectedCommodities?: CommodityName[]
): Map<string, { commodity: CommodityName; signalType: SignalType; strength: number }[]> {
  const signals = new Map<string, { commodity: CommodityName; signalType: SignalType; strength: number }[]>();
  const commodities: CommodityName[] = selectedCommodities || [
    'corn', 'wheat', 'soybeans',           // Grains
    'orange_juice', 'coffee', 'sugar', 'cotton', 'cocoa',  // Softs
    'tomatoes', 'avocados', 'almonds', 'lettuce',          // Produce
  ];

  const current = new Date(startDate);
  let phase = 0; // Weather cycle phase

  while (current <= endDate) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      const dateStr = current.toISOString().split('T')[0];
      const daySignals: { commodity: CommodityName; signalType: SignalType; strength: number }[] = [];

      // Simulate weather-driven signals with seasonal patterns
      const dayOfYear = Math.floor((current.getTime() - new Date(current.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
      phase = Math.sin(dayOfYear / 30) * 0.5 + Math.sin(dayOfYear / 90) * 0.3;

      for (const commodity of commodities) {
        // Add some randomness and commodity-specific patterns (using seeded RNG)
        const commodityOffset = commodity === 'wheat' ? 0.1 : commodity === 'corn' ? -0.05 : 0;
        const noise = (rng.next() - 0.5) * 0.4;
        const rawScore = phase + commodityOffset + noise;

        let signalType: SignalType;
        let strength: number;

        if (rawScore > 0.2) {
          signalType = 'avoid_short';
          strength = Math.min(1, Math.abs(rawScore));
        } else if (rawScore < -0.1) {
          signalType = 'short';
          strength = Math.min(1, Math.abs(rawScore));
        } else {
          signalType = 'neutral';
          strength = Math.abs(rawScore);
        }

        daySignals.push({ commodity, signalType, strength });
      }

      signals.set(dateStr, daySignals);
    }
    current.setDate(current.getDate() + 1);
  }

  return signals;
}

// Default commodities for simulation
const ALL_SIMULATION_COMMODITIES: CommodityName[] = [
  'corn', 'wheat', 'soybeans',
  'orange_juice', 'coffee', 'sugar', 'cotton', 'cocoa',
  'tomatoes', 'avocados', 'almonds', 'lettuce',
];

export function runBacktest(config: SimulationConfig): SimulationResult {
  // Initialize seeded RNG for deterministic results
  const seed = createSeed(config);
  rng = new SeededRandom(seed);
  idCounter = 0;

  const startDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);

  // Get commodities to simulate (use config or default to all)
  const commoditiesToSimulate = config.commodities || ALL_SIMULATION_COMMODITIES;

  // Generate historical data for each commodity
  const priceMap = {} as Record<CommodityName, Map<string, number>>;
  for (const commodity of commoditiesToSimulate) {
    const prices = generateHistoricalPrices(commodity, startDate, endDate);
    priceMap[commodity] = new Map(prices.map(p => [p.date, p.price]));
  }

  const historicalSignals = generateHistoricalSignals(startDate, endDate, commoditiesToSimulate);

  // Simulation state
  let cash = config.initialCapital;
  let equity = config.initialCapital;
  let peakEquity = config.initialCapital;
  const openTrades: Trade[] = [];
  const closedTrades: Trade[] = [];
  const dailySnapshots: DailySnapshot[] = [];

  // Get all trading days
  const tradingDays = Array.from(historicalSignals.keys()).sort();

  for (const dateStr of tradingDays) {
    const daySignals = historicalSignals.get(dateStr) || [];

    // Update open positions with current prices
    let dayPnl = 0;
    for (const trade of openTrades) {
      const currentPrice = priceMap[trade.commodity].get(dateStr);
      if (!currentPrice) continue;

      // Calculate unrealized P&L
      const priceDiff = trade.direction === 'short'
        ? trade.entryPrice - currentPrice
        : currentPrice - trade.entryPrice;
      const unrealizedPnl = priceDiff * trade.quantity;

      // Check stop loss / take profit
      const pnlPercent = priceDiff / trade.entryPrice;

      if (pnlPercent <= -config.stopLoss) {
        // Stop loss hit
        trade.exitPrice = currentPrice;
        trade.closeDate = dateStr;
        trade.pnl = unrealizedPnl;
        trade.pnlPercent = pnlPercent * 100;
        trade.status = 'stopped';
        trade.exitReason = 'stop_loss';
        dayPnl += unrealizedPnl;
        cash += (trade.entryPrice * trade.quantity) + unrealizedPnl;
      } else if (pnlPercent >= config.takeProfit) {
        // Take profit hit
        trade.exitPrice = currentPrice;
        trade.closeDate = dateStr;
        trade.pnl = unrealizedPnl;
        trade.pnlPercent = pnlPercent * 100;
        trade.status = 'closed';
        trade.exitReason = 'take_profit';
        dayPnl += unrealizedPnl;
        cash += (trade.entryPrice * trade.quantity) + unrealizedPnl;
      }
    }

    // Move closed trades
    const stillOpen = openTrades.filter(t => t.status === 'open');
    const justClosed = openTrades.filter(t => t.status !== 'open');
    closedTrades.push(...justClosed);
    openTrades.length = 0;
    openTrades.push(...stillOpen);

    // Check for new signals above threshold
    for (const signal of daySignals) {
      if (signal.signalType === 'short' && signal.strength >= config.signalThreshold) {
        // Check if we already have a position in this commodity
        const hasPosition = openTrades.some(t => t.commodity === signal.commodity);
        if (hasPosition) continue;

        // Open new short position
        const currentPrice = priceMap[signal.commodity].get(dateStr);
        if (!currentPrice) continue;

        const positionValue = equity * config.positionSize;
        if (positionValue > cash) continue; // Not enough cash

        const quantity = Math.floor(positionValue / currentPrice);
        if (quantity <= 0) continue;

        const tradeValue = currentPrice * quantity;
        cash -= tradeValue;

        openTrades.push({
          id: generateId(),
          openDate: dateStr,
          closeDate: null,
          commodity: signal.commodity,
          direction: 'short',
          entryPrice: currentPrice,
          exitPrice: null,
          quantity,
          signalStrength: signal.strength,
          pnl: null,
          pnlPercent: null,
          status: 'open',
          exitReason: null,
        });
      }
    }

    // Calculate equity
    let openPositionValue = 0;
    for (const trade of openTrades) {
      const currentPrice = priceMap[trade.commodity].get(dateStr);
      if (!currentPrice) continue;

      const priceDiff = trade.direction === 'short'
        ? trade.entryPrice - currentPrice
        : currentPrice - trade.entryPrice;
      openPositionValue += (trade.entryPrice * trade.quantity) + (priceDiff * trade.quantity);
    }

    equity = cash + openPositionValue;
    peakEquity = Math.max(peakEquity, equity);
    const drawdown = (peakEquity - equity) / peakEquity;

    dailySnapshots.push({
      date: dateStr,
      equity,
      cash,
      openPositions: openTrades.length,
      dayPnl,
      totalPnl: equity - config.initialCapital,
      drawdown,
      signals: daySignals,
    });
  }

  // Close any remaining open positions at end
  const lastDate = tradingDays[tradingDays.length - 1];
  for (const trade of openTrades) {
    const currentPrice = priceMap[trade.commodity].get(lastDate);
    if (!currentPrice) continue;

    const priceDiff = trade.direction === 'short'
      ? trade.entryPrice - currentPrice
      : currentPrice - trade.entryPrice;
    const pnl = priceDiff * trade.quantity;

    trade.exitPrice = currentPrice;
    trade.closeDate = lastDate;
    trade.pnl = pnl;
    trade.pnlPercent = (priceDiff / trade.entryPrice) * 100;
    trade.status = 'closed';
    trade.exitReason = 'end_of_sim';
    closedTrades.push(trade);
  }

  // Calculate metrics
  const metrics = calculateMetrics(config, closedTrades, dailySnapshots);

  return {
    config,
    trades: closedTrades,
    dailySnapshots,
    metrics,
    status: 'completed',
  };
}

function calculateMetrics(
  config: SimulationConfig,
  trades: Trade[],
  snapshots: DailySnapshot[]
): PerformanceMetrics {
  const finalEquity = snapshots[snapshots.length - 1]?.equity || config.initialCapital;
  const totalPnl = finalEquity - config.initialCapital;
  const totalReturn = (totalPnl / config.initialCapital) * 100;

  const winningTrades = trades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = trades.filter(t => (t.pnl || 0) < 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));

  const avgWin = winningTrades.length > 0
    ? grossProfit / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length > 0
    ? grossLoss / losingTrades.length
    : 0;

  // Calculate Sharpe ratio (simplified)
  const dailyReturns = snapshots.map((s, i) =>
    i === 0 ? 0 : (s.equity - snapshots[i - 1].equity) / snapshots[i - 1].equity
  );
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const stdDev = Math.sqrt(
    dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
  );
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  // Max drawdown
  const maxDrawdown = Math.max(...snapshots.map(s => s.drawdown)) * 100;
  const maxDrawdownDollar = Math.max(...snapshots.map(s => {
    const peak = Math.max(...snapshots.slice(0, snapshots.indexOf(s) + 1).map(ss => ss.equity));
    return peak - s.equity;
  }));

  // Average trade duration
  const tradeDurations = trades.map(t => {
    if (!t.closeDate) return 0;
    return (new Date(t.closeDate).getTime() - new Date(t.openDate).getTime()) / (24 * 60 * 60 * 1000);
  });
  const avgTradeDuration = tradeDurations.length > 0
    ? tradeDurations.reduce((a, b) => a + b, 0) / tradeDurations.length
    : 0;

  // Best and worst trades
  const sortedByPnl = [...trades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));

  return {
    totalReturn,
    totalPnl,
    finalEquity,
    maxDrawdown,
    maxDrawdownDollar,
    sharpeRatio,
    winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgWin,
    avgLoss,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    avgTradeDuration,
    bestTrade: sortedByPnl[0] || null,
    worstTrade: sortedByPnl[sortedByPnl.length - 1] || null,
  };
}
