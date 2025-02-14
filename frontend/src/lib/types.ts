export interface StockDataResponse {
  symbol: string;
  source_file: string;
  start_date: string | null; // ISO date string format YYYY-MM-DD
  latest_date: string | null; // ISO date string format YYYY-MM-DD
  stock_name: string | null;
  isEtf: boolean;
}
