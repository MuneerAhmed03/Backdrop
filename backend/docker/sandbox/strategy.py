from abc import ABC, abstractmethod
from typing import List
import pandas as pd
from dataclasses import dataclass
from datetime import datetime
import numpy as np 
import heapq

@dataclass
class Trade:
    entry_date: datetime
    exit_date: datetime
    entry_price: float
    exit_price: float
    quantity: int
    side: str
    pnl: float
    exit_reason: str

@dataclass
class StrategyResult:
    initialCapital: float
    finalCapital: float
    equityCurve: List[dict]
    drawdownCurve: List[dict]
    trades: List[Trade]
    totalReturn: float
    totalReturnPct: float
    sharpeRatio: float
    maxDrawdown: float
    maxDrawdownPct: float
    winRate: float
    profitFactor: float | str
    numTrades: int
    avgTradePnl: float
    avgWinnerPnl: float | str
    avgLoserPnl: float | str 
    annualizedVolatility: float
    calmarRatio: float | str 
    sortinoRatio: float | str

class BaseStrategy(ABC):
    def __init__(self, data: pd.DataFrame, initial_capital: float = 100000,investment_per_trade:float = 10000,trading_method:int = 0):
        self.data = data
        self.data.set_index('Date', inplace=True)
        self.data.columns = self.data.columns.str.lower()
        self.initialCapital = initial_capital
        self.availableCapital = initial_capital
        self.currentPosition = 0
        self.trades: List[Trade] = []
        self.equityCurve = pd.Series(initial_capital, index=data.index)
        self.positions = pd.Series(0, index=data.index)
        self.investment_per_trade = investment_per_trade
        self.trading_method = trading_method
        self.max_positions = -1;

    @abstractmethod
    def generate_signals(self) -> None:
        """Subclasses must implement this method and add a 'signal' column to `self.data`."""

    def calculate_final_capital(self) -> float:
        return self.equityCurve.iloc[-1]

    def calculate_equity_curve(self) -> pd.Series:
        return self.equityCurve

    def calculate_drawdown_curve(self) -> pd.Series:
        rolling_max = self.equityCurve.expanding().max()
        drawdowns = (self.equityCurve - rolling_max) / rolling_max
        return drawdowns

    def calculate_total_return(self) -> float:
        return self.calculate_final_capital() - self.initialCapital

    def calculate_total_return_pct(self) -> float:
        return (self.calculate_final_capital() / self.initialCapital - 1) * 100

    def calculate_sharpe_ratio(self, risk_free_rate: float = 0.02) -> float:
        returns = self.equityCurve.pct_change().dropna()
        excess_returns = returns - risk_free_rate / 252
        if len(excess_returns) == 0:
            return 0.0
        return np.sqrt(252) * excess_returns.mean() / excess_returns.std()

    def calculate_max_drawdown(self) -> float:
        return self.calculate_drawdown_curve().min() * self.initialCapital

    def calculate_max_drawdown_pct(self) -> float:
        return self.calculate_drawdown_curve().min() * 100

    def calculate_win_rate(self) -> float:
        if not self.trades:
            return 0.0
        winning_trades = sum(1 for trade in self.trades if trade.pnl > 0)
        return (winning_trades / len(self.trades)) * 100

    def calculate_profit_factor(self) -> float:
        gross_profits = sum(trade.pnl for trade in self.trades if trade.pnl > 0)
        gross_losses = abs(sum(trade.pnl for trade in self.trades if trade.pnl < 0))
        if gross_losses == 0:
            return "∞" if gross_profits > 0 else 0.0
        return gross_profits / gross_losses

    def calculate_avg_trade_pnl(self) -> float:
        if not self.trades:
            return 0.0
        return sum(trade.pnl for trade in self.trades) / len(self.trades)

    def calculate_avg_winner_pnl(self) -> float:
        winning_trades = [trade.pnl for trade in self.trades if trade.pnl > 0]
        return sum(winning_trades) / len(winning_trades) if winning_trades else "N/A"

    def calculate_avg_loser_pnl(self) -> float:
        losing_trades = [trade.pnl for trade in self.trades if trade.pnl < 0]
        return sum(losing_trades) / len(losing_trades) if losing_trades else "N/A"

    def calculate_annualized_volatility(self) -> float:
        returns = self.equityCurve.pct_change().dropna()
        return returns.std() * np.sqrt(252) * 100

    def calculate_calmar_ratio(self) -> float:
        max_dd = self.calculate_max_drawdown_pct()
        if max_dd == 0:
            return "∞" if self.calculate_total_return_pct() > 0 else 0.0
        return self.calculate_total_return_pct() / abs(max_dd)

    def calculate_sortino_ratio(self, risk_free_rate: float = 0.02) -> float:
        returns = self.equityCurve.pct_change().dropna()
        excess_returns = returns - risk_free_rate / 252
        downside_returns = excess_returns[excess_returns < 0]
        if len(downside_returns) == 0:
            return "∞" if excess_returns.mean() > 0 else 0.0                                                                                                                ll
        return np.sqrt(252) * excess_returns.mean() / downside_returns.std()

    def _close_trade(self, trade:Trade , exit_price,index_pos):
        trade.exit_date = self.data.index[index_pos]
        trade.exit_price = exit_price
        trade.pnl = (exit_price - trade.entry_price) * trade.quantity

        replenishedCapital = trade.quantity * exit_price
        self.availableCapital += replenishedCapital


    def run_backtest(self) -> StrategyResult:
        self.generate_signals()
        if 'signal' not in self.data.columns:
            raise ValueError("No 'signal' column found in DataFrame. Implement generate_signals() correctly.")

        signals = self.data['signal']
        self.openTrades = []
        heapq.heapify(self.openTrades)
        loop_count =0
        for i in range(1, len(self.data)):
            price = self.data['close'].iloc[i]
            loop_count+=1;
            if signals.iloc[i] == 1:
                quantity = self.investment_per_trade // price

                if quantity > 0 : 
                    trade_cost = quantity * price

                    if trade_cost  <= self.availableCapital:
                        new_trade = Trade(
                            entry_date=self.data.index[i],
                            exit_date=None,
                            entry_price=price,
                            exit_price=None,
                            quantity=quantity,
                            side='LONG', 
                            pnl=0,
                            exit_reason='signal'
                        )
                        self.currentPosition+=1
                        trade_index = len(self.trades)
                        self.trades.append(new_trade)
                        key = new_trade.pnl if self.trading_method == 0 else -new_trade.pnl
                        heapq.heappush(self.openTrades, (key,trade_index))
                        self.availableCapital -= trade_cost

                elif signals.iloc[i] == -1:
                    if self.openTrades:
                        _, trade_index = heapq.heappop(self.openTrades)
                        trade = self.trades[trade_index]
                        self._close_trade(trade, price, i)
                        self.currentPosition-=1

    
            self.equityCurve.iloc[i] = self.equityCurve.iloc[i - 1]

            updated_open_trades = []
            
            for _, trade_index in list(self.openTrades):
                open_trade = self.trades[trade_index]
                price_change = self.data['close'].iloc[i]-self.data['close'].iloc[i - 1]
                daily_pnl = price_change * open_trade.quantity
                self.equityCurve.iloc[i] += daily_pnl
                open_trade.pnl+=daily_pnl

                updated_key = open_trade.pnl if self.trading_method == 0 else -open_trade.pnl
                updated_open_trades.append((updated_key, trade_index))
            
            self.max_positions = max(self.max_positions,self.currentPosition)
            self.openTrades = updated_open_trades
            heapq.heapify(self.openTrades)
 
        if self.openTrades:
            last_price = self.data['close'].iloc[-1]
            while self.openTrades: 
                priority_key, trade_index = heapq.heappop(self.openTrades)
                trade_to_close = self.trades[trade_index]
                self._close_trade(trade_to_close, last_price, len(self.data) - 1)

        # print(f"loop_count = {loop_count}")
        equity_curve_data = [
            {"date": str(date), "value": value}
            for date, value in self.equityCurve.items()
        ]
        
        drawdown_curve_data = [
            {"date": str(date), "value": value}
            for date, value in self.calculate_drawdown_curve().items()
        ] 

        return StrategyResult(
            initialCapital=self.initialCapital,
            finalCapital=self.calculate_final_capital(),
            totalReturn=self.calculate_total_return(),
            totalReturnPct=self.calculate_total_return_pct(),
            sharpeRatio=self.calculate_sharpe_ratio(),
            maxDrawdown=self.calculate_max_drawdown(),
            maxDrawdownPct=self.calculate_max_drawdown_pct(),
            winRate=self.calculate_win_rate(),
            profitFactor=self.calculate_profit_factor(),
            numTrades=len(self.trades),
            avgTradePnl=self.calculate_avg_trade_pnl(),
            avgWinnerPnl=self.calculate_avg_winner_pnl(),
            avgLoserPnl=self.calculate_avg_loser_pnl(),
            annualizedVolatility=self.calculate_annualized_volatility(),
            calmarRatio=self.calculate_calmar_ratio(),
            sortinoRatio=self.calculate_sortino_ratio(),
            equityCurve=equity_curve_data,
            drawdownCurve=drawdown_curve_data,
            trades=self.trades,
        )
