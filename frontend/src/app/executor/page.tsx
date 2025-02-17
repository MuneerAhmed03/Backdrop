"use client";

import { useState, useCallback, useEffect } from "react";
import { CodeEditor } from "@/components/executor/CodeEditor";
import { Header } from "@/components/executor/Header";
import { TemplatesModal } from "@/components/executor/Templates";
import { BookOpen, ChevronRight, Settings2 } from "lucide-react";
import SearchBar from "@/components/executor/SearchBar";
import { executeCode } from "@/lib/Polling";
import { StockDataResponse } from "@/lib/types";
import Result from "@/components/results/Result";

const DEFAULT_CODE = `
  def backtest(data):
    """
    Perform a backtest on historical OHLC data.

    Parameters:
    data (pd.DataFrame): A Pandas DataFrame with the following columns:
        - 'date' (str): Date in YYYY-MM-DD format.
        - 'open' (float): Opening price of the instrument.
        - 'high' (float): Highest price of the day.
        - 'low' (float): Lowest price of the day.
        - 'close' (float): Closing price of the instrument.
        - 'volume' (int): Trading volume.

    Example row:
        date       | open  | high  | low   | close | volume  
        -----------|-------|-------|-------|-------|--------
        2024-01-01 | 100.5 | 105.0 | 99.5  | 103.2 | 1200000

    Returns:
    pd.DataFrame: A DataFrame with added strategy signals.
    """   
`;

export default function Executor() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showParameters, setShowParameters] = useState(true);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [result, setResult] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [instrument, setInstrument] = useState<StockDataResponse | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 280 && newWidth < 600) {
        setPanelWidth(newWidth);
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove]);

  const handleRunStrategy = async () => {
    executeCode(code, instrument?.symbol || "20microns");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle)]">
      <Header
        onRunStrategy={handleRunStrategy}
        onShowTemplates={() => setShowTemplates(true)}
      />

      <div className="flex-1 flex mt-16">
        <div className="flex-1 p-4 min-w-0">
          <div className="w-full h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl overflow-hidden shadow-[var(--shadow-lg)]">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown} />

        <div
          style={{ width: showParameters ? panelWidth : 0 }}
          className={`border-l border-[var(--border)] bg-[var(--card)] backdrop-blur-xl transition-all duration-300 ease-in-out ${
            showParameters ? "translate-x-0" : "translate-x-full"
          } ${isResizing ? "transition-none" : ""}`}
        >
          <div className="h-12 border-b border-[var(--border)] flex items-center justify-between px-4">
            <div className="flex items-center">
              <Settings2 className="w-4 h-4 mr-2 text-[var(--foreground-subtle)]" />
              <span className="font-medium">Parameters</span>
            </div>
            <button
              onClick={() => setShowParameters(!showParameters)}
              className="btn-ghost p-1 hover:bg-[var(--card-hover)] rounded-lg"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${showParameters ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Intrument
                </label>
                <SearchBar
                  onSelectItem={setInstrument}
                  selectedItem={instrument}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Time Period
                </label>
                <select className="input">
                  <option>Last 1 Year</option>
                  <option>Last 2 Years</option>
                  <option>Last 5 Years</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Capital
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="Enter amount"
                  defaultValue={100000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="Enter percentage"
                  defaultValue={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
      <Result />
    </div>
  );
}
