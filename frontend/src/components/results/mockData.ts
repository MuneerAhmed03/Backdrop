
import { StrategyResult, Trade } from "@/lib/types";

const generateEquityCurve = (days: number, initialCapital: number): number[] => {
  const curve = [initialCapital];
  let currentValue = initialCapital;
  
  for (let i = 1; i < days; i++) {
    const change = currentValue * (Math.random() * 0.02 - 0.01);
    currentValue += change;
    curve.push(currentValue);
  }
  
  return curve;
};

const generateDrawdownCurve = (equityCurve: number[]): number[] => {
  const drawdowns = [];
  let peak = equityCurve[0];
  
  for (const value of equityCurve) {
    peak = Math.max(peak, value);
    const drawdown = (peak - value) / peak * 100;
    drawdowns.push(-drawdown); // Negative for visual representation
  }
  
  return drawdowns;
};

const generateTrades = (days: number): Trade[] => {
  const trades: Trade[] = [];
  let currentDate = new Date("2023-01-01");
  
  for (let i = 0; i < days/2; i++) {
    const entryDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1);
    const exitDate = new Date(currentDate);
    
    const entryPrice = 100 + Math.random() * 50;
    const exitPrice = entryPrice * (1 + (Math.random() * 0.1 - 0.05));
    const quantity = Math.floor(Math.random() * 100) + 1;
    const pnl = (exitPrice - entryPrice) * quantity;
    
    trades.push({
      entryDate: entryDate.toISOString(),
      exitDate: exitDate.toISOString(),
      entryPrice,
      exitPrice,
      quantity,
      side: Math.random() > 0.5 ? "BUY" : "SELL",
      pnl,
      exitReason: Math.random() > 0.5 ? "Take Profit" : "Stop Loss"
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return trades;
};

export const generateDummyData = (): StrategyResult => {
  const days = 180;
  const initialCapital = 100000;
  const equityCurve = generateEquityCurve(days, initialCapital);
  const trades = generateTrades(days);
  
  const finalCapital = equityCurve[equityCurve.length - 1];
  const drawdownCurve = generateDrawdownCurve(equityCurve);
  const maxDrawdown = Math.min(...drawdownCurve);
  
  const winners = trades.filter(t => t.pnl > 0);
  const losers = trades.filter(t => t.pnl <= 0);
  
  return {
    initialCapital,
    finalCapital,
    equityCurve,
    drawdownCurve,
    trades,
    totalReturn: finalCapital - initialCapital,
    totalReturnPct: ((finalCapital - initialCapital) / initialCapital) * 100,
    sharpeRatio: 1.8,
    maxDrawdown: Math.abs(maxDrawdown * initialCapital / 100),
    maxDrawdownPct: Math.abs(maxDrawdown),
    winRate: (winners.length / trades.length) * 100,
    profitFactor: Math.abs(winners.reduce((sum, t) => sum + t.pnl, 0) / losers.reduce((sum, t) => sum + t.pnl, 0)),
    numTrades: trades.length,
    avgTradePnl: trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length,
    avgWinnerPnl: winners.reduce((sum, t) => sum + t.pnl, 0) / winners.length,
    avgLoserPnl: losers.reduce((sum, t) => sum + t.pnl, 0) / losers.length,
    annualizedVolatility: 15.5,
    calmarRatio: 2.1,
    sortinoRatio: 2.4
  };
};