'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BacktestResult {
  returns: number
  sharpeRatio: number
  maxDrawdown: number
  trades: number
  winRate: number
  equity: number[]
}

interface BacktestResultsProps {
  results: BacktestResult | null
  isVisible: boolean
  onClose: () => void
}

export function BacktestResults({ results, isVisible, onClose }: BacktestResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'equity'>('overview')

  if (!isVisible || !results) return null

  const equityChartData = results.equity.map((value, index) => ({
    day: `Day ${index + 1}`,
    value: value
  }))

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glossy-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
        <div className="p-6 border-b border-[#222222] flex justify-between items-center bg-gradient-to-b from-[#222222] to-[#111111]">
          <h2 className="text-xl font-bold">Backtest Results</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-[#222222] bg-black/50">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-white bg-white/5'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all duration-200 ${
                activeTab === 'trades'
                  ? 'text-white border-b-2 border-white bg-white/5'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
              onClick={() => setActiveTab('trades')}
            >
              Trades
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all duration-200 ${
                activeTab === 'equity'
                  ? 'text-white border-b-2 border-white bg-white/5'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
              onClick={() => setActiveTab('equity')}
            >
              Equity Curve
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] bg-black/30">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="glossy-card hover:scale-[1.02] transition-transform duration-200">
                <div className="text-sm text-gray-400 mb-1">Total Return</div>
                <div className="text-2xl font-bold text-green-400">
                  {results.returns.toFixed(2)}%
                </div>
              </div>
              <div className="glossy-card hover:scale-[1.02] transition-transform duration-200">
                <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-white">
                  {results.sharpeRatio.toFixed(2)}
                </div>
              </div>
              <div className="glossy-card hover:scale-[1.02] transition-transform duration-200">
                <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
                <div className="text-2xl font-bold text-red-400">
                  {results.maxDrawdown.toFixed(2)}%
                </div>
              </div>
              <div className="glossy-card hover:scale-[1.02] transition-transform duration-200">
                <div className="text-sm text-gray-400 mb-1">Total Trades</div>
                <div className="text-2xl font-bold text-white">
                  {results.trades}
                </div>
              </div>
              <div className="glossy-card hover:scale-[1.02] transition-transform duration-200">
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-2xl font-bold text-white">
                  {results.winRate.toFixed(2)}%
                </div>
              </div>
              <div className="glossy-card hover:scale-[1.02] transition-transform duration-200">
                <div className="text-sm text-gray-400 mb-1">Final Equity</div>
                <div className="text-2xl font-bold text-green-400">
                  ₹{(results.equity[results.equity.length - 1]).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="glossy-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-[#222222]">
                    <th className="pb-3 text-gray-400 font-medium">Date</th>
                    <th className="pb-3 text-gray-400 font-medium">Type</th>
                    <th className="pb-3 text-gray-400 font-medium">Price</th>
                    <th className="pb-3 text-gray-400 font-medium">Size</th>
                    <th className="pb-3 text-gray-400 font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#222222]">
                    <td className="py-3">2024-01-20</td>
                    <td className="py-3 text-green-400">BUY</td>
                    <td className="py-3">₹1,500.00</td>
                    <td className="py-3">100</td>
                    <td className="py-3 text-green-400">+₹5,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'equity' && (
            <div className="glossy-card h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityChartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis
                    dataKey="day"
                    stroke="#666666"
                    tick={{ fill: '#666666' }}
                    tickLine={{ stroke: '#666666' }}
                  />
                  <YAxis
                    stroke="#666666"
                    tick={{ fill: '#666666' }}
                    tickLine={{ stroke: '#666666' }}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      border: '1px solid #222222',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#666666' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Equity']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    dot={false}
                    fill="url(#colorValue)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#222222] flex justify-end bg-gradient-to-b from-[#222222] to-[#111111]">
          <button
            onClick={onClose}
            className="glossy-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 