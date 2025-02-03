from abc import ABC, abstractmethod
from typing import List
import pandas as pd
from dataclasses import dataclass
from datetime import datetime
import numpy as np

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
    initial_capital: float
    final_capital: float
    equity_curve: pd.Series
    drawdown_curve: pd.Series
    trades: List[Trade]
    total_return: float
    total_return_pct: float
    sharpe_ratio: float
    max_drawdown: float
    max_drawdown_pct: float
    win_rate: float
    profit_factor: float
    num_trades: int
    avg_trade_pnl: float
    avg_winner_pnl: float
    avg_loser_pnl: float
    annualized_volatility: float
    calmar_ratio: float
    sortino_ratio: float

class BaseStrategy(ABC):
    def __init__(self, data: pd.DataFrame, initial_capital: float = 100000):
        self.data = data
        self.data.set_index('Date', inplace=True)
        self.data.columns = self.data.columns.str.lower()  # Case-insensitive column access
        self.initial_capital = initial_capital
        self.current_position = 0
        self.trades: List[Trade] = []
        self.equity_curve = pd.Series(initial_capital, index=data.index)
        self.positions = pd.Series(0, index=data.index)

    @abstractmethod
    def generate_signals(self) -> None:
        """Subclasses must implement this method and add a 'signal' column to `self.data`."""

    def calculate_final_capital(self) -> float:
        return self.equity_curve.iloc[-1]

    def calculate_equity_curve(self) -> pd.Series:
        return self.equity_curve

    def calculate_drawdown_curve(self) -> pd.Series:
        rolling_max = self.equity_curve.expanding().max()
        drawdowns = (self.equity_curve - rolling_max) / rolling_max
        return drawdowns

    def calculate_total_return(self) -> float:
        return self.calculate_final_capital() - self.initial_capital

    def calculate_total_return_pct(self) -> float:
        return (self.calculate_final_capital() / self.initial_capital - 1) * 100

    def calculate_sharpe_ratio(self, risk_free_rate: float = 0.02) -> float:
        returns = self.equity_curve.pct_change().dropna()
        excess_returns = returns - risk_free_rate / 252
        if len(excess_returns) == 0:
            return 0.0
        return np.sqrt(252) * excess_returns.mean() / excess_returns.std()

    def calculate_max_drawdown(self) -> float:
        return self.calculate_drawdown_curve().min() * self.initial_capital

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
        return gross_profits / gross_losses if gross_losses != 0 else float('inf')

    def calculate_avg_trade_pnl(self) -> float:
        if not self.trades:
            return 0.0
        return sum(trade.pnl for trade in self.trades) / len(self.trades)

    def calculate_avg_winner_pnl(self) -> float:
        winning_trades = [trade.pnl for trade in self.trades if trade.pnl > 0]
        return sum(winning_trades) / len(winning_trades) if winning_trades else 0.0

    def calculate_avg_loser_pnl(self) -> float:
        losing_trades = [trade.pnl for trade in self.trades if trade.pnl < 0]
        return sum(losing_trades) / len(losing_trades) if losing_trades else 0.0

    def calculate_annualized_volatility(self) -> float:
        returns = self.equity_curve.pct_change().dropna()
        return returns.std() * np.sqrt(252) * 100

    def calculate_calmar_ratio(self) -> float:
        max_dd = self.calculate_max_drawdown_pct()
        if max_dd == 0:
            return float('inf')
        return self.calculate_total_return_pct() / abs(max_dd)

    def calculate_sortino_ratio(self, risk_free_rate: float = 0.02) -> float:
        returns = self.equity_curve.pct_change().dropna()
        excess_returns = returns - risk_free_rate / 252
        downside_returns = excess_returns[excess_returns < 0]
        if len(downside_returns) == 0:
            return float('inf')
        return np.sqrt(252) * excess_returns.mean() / downside_returns.std()

    def run_backtest(self) -> StrategyResult:
        self.generate_signals()
        if 'signal' not in self.data.columns:
            raise ValueError("No 'signal' column found in DataFrame. Implement generate_signals() correctly.")

        signals = self.data['signal']

        for i in range(1, len(self.data)):
            if signals.iloc[i] != signals.iloc[i - 1]:
                price = self.data['close'].iloc[i]
                if signals.iloc[i] == 1:
                    self.trades.append(Trade(
                        entry_date=self.data.index[i],
                        exit_date=None,
                        entry_price=price,
                        exit_price=None,
                        quantity=100,
                        side='LONG',
                        pnl=0,
                        exit_reason='signal'
                    ))
                elif signals.iloc[i] == -1 and self.trades:
                    last_trade = self.trades[-1]
                    if last_trade.exit_date is None:
                        last_trade.exit_date = self.data.index[i]
                        last_trade.exit_price = price
                        last_trade.pnl = (price - last_trade.entry_price) * last_trade.quantity

            self.equity_curve.iloc[i] = self.equity_curve.iloc[i - 1]
            if self.trades and self.trades[-1].exit_date is None:
                price_change = self.data['close'].iloc[i] - self.data['close'].iloc[i - 1]
                self.equity_curve.iloc[i] += price_change * 100

        if self.trades and self.trades[-1].exit_date is None:
            last_trade = self.trades[-1]
            last_price = self.data['close'].iloc[-1]
            last_trade.exit_date = self.data.index[-1]
            last_trade.exit_price = last_price
            last_trade.pnl = (last_price - last_trade.entry_price) * last_trade.quantity

        return StrategyResult(
            initial_capital=self.initial_capital,
            final_capital=self.calculate_final_capital(),
            equity_curve=self.calculate_equity_curve(),
            drawdown_curve=self.calculate_drawdown_curve(),
            trades=self.trades,
            total_return=self.calculate_total_return(),
            total_return_pct=self.calculate_total_return_pct(),
            sharpe_ratio=self.calculate_sharpe_ratio(),
            max_drawdown=self.calculate_max_drawdown(),
            max_drawdown_pct=self.calculate_max_drawdown_pct(),
            win_rate=self.calculate_win_rate(),
            profit_factor=self.calculate_profit_factor(),
            num_trades=len(self.trades),
            avg_trade_pnl=self.calculate_avg_trade_pnl(),
            avg_winner_pnl=self.calculate_avg_winner_pnl(),
            avg_loser_pnl=self.calculate_avg_loser_pnl(),
            annualized_volatility=self.calculate_annualized_volatility(),
            calmar_ratio=self.calculate_calmar_ratio(),
            sortino_ratio=self.calculate_sortino_ratio()
        )
