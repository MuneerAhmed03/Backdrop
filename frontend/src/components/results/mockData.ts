
import { addDays } from 'date-fns';

export type Trade = {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  side: string;
  pnl: number;
  exitReason: string;
};

export type StrategyResult = {
  initialCapital: number;
  finalCapital: number;
  equityCurve: number[];
  drawdownCurve: number[];
  trades: Trade[];
  totalReturn: number;
  totalReturnPct: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  winRate: number;
  profitFactor: number;
  numTrades: number;
  avgTradePnl: number;
  avgWinnerPnl: number;
  avgLoserPnl: number;
  annualizedVolatility: number;
  calmarRatio: number;
  sortinoRatio: number;
};

const startDate = new Date('2024-01-01');
const numDays = 90;

const generateEquityCurve = () => {
  const curve = [];
  let equity = 100000;

  for (let i = 0; i < numDays; i++) {
    const change = (Math.random() - 0.48) * 1000;
    equity += change;
    curve.push(equity);
  }
  return curve;
};

const generateDrawdownCurve = (equityCurve: number[]) => {
  const drawdowns = [];
  let peak = equityCurve[0];

  for (const value of equityCurve) {
    peak = Math.max(peak, value);
    const drawdown = ((peak - value) / peak) * 100;
    drawdowns.push(drawdown);
  }
  return drawdowns;
};

const equityCurve = generateEquityCurve();
const drawdownCurve = generateDrawdownCurve(equityCurve);

export const mockData: StrategyResult = {
  initialCapital: 100000,
  finalCapital: equityCurve[equityCurve.length - 1],
  equityCurve,
  drawdownCurve,
  trades: Array.from({ length: 50 }, (_, i) => ({
    entryDate: addDays(startDate, Math.floor(i * 1.8)).toISOString(),
    exitDate: addDays(startDate, Math.floor(i * 1.8 + 1)).toISOString(),
    entryPrice: 100 + Math.random() * 20,
    exitPrice: 100 + Math.random() * 20,
    quantity: Math.floor(Math.random() * 100) + 1,
    side: Math.random() > 0.5 ? 'BUY' : 'SELL',
    pnl: (Math.random() - 0.4) * 1000,
    exitReason: ['Take Profit', 'Stop Loss', 'Signal Exit'][Math.floor(Math.random() * 3)],
  })),
  totalReturn: equityCurve[equityCurve.length - 1] - 100000,
  totalReturnPct: ((equityCurve[equityCurve.length - 1] - 100000) / 100000) * 100,
  sharpeRatio: 1.8,
  maxDrawdown: Math.max(...drawdownCurve),
  maxDrawdownPct: Math.max(...drawdownCurve),
  winRate: 0.65,
  profitFactor: 1.5,
  numTrades: 50,
  avgTradePnl: 240,
  avgWinnerPnl: 580,
  avgLoserPnl: -320,
  annualizedVolatility: 12.5,
  calmarRatio: 2.1,
  sortinoRatio: 2.4,
};
