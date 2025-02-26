export interface StockDataResponse {
  symbol: string;
  source_file: string;
  start_date: string | null; // ISO date string format YYYY-MM-DD
  latest_date: string | null; // ISO date string format YYYY-MM-DD
  stock_name: string | null;
  isEtf: boolean;
}



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

type CurvePoint = {
  date: string;
  value: number;
};


export type StrategyResult = {
  initialCapital: number;
  finalCapital: number;
  equityCurve: CurvePoint[];
  drawdownCurve: CurvePoint[];
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