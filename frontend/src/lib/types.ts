export interface StockDataResponse {
  symbol: string;
  source_file: string;
  start_date: string | null; 
  latest_date: string | null; 
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
  profitFactor: number | string; 
  numTrades: number; 
  avgTradePnl: number; 
  avgWinnerPnl: number | string;
  avgLoserPnl: number | string ;
  annualizedVolatility: number;
  calmarRatio: number | string;
  sortinoRatio: number | string ;
};

export type Template = {
  id:number;
  title:string;
  description:string;
  code?:string;
  tags?:string
}


// interface BaseStrategy {
//   id: number;
//   title: string;
//   description: string | null;
// }

// interface TemplateStrategy extends BaseStrategy {
//   code: string;
//   tags: string | null;
// }

// interface UserStrategy extends BaseStrategy {
//   author: string; // since you're using StringRelatedField
//   code: string;
// }