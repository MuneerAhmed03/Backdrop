"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CodeEditor } from "@/components/executor/CodeEditor";
import { Header } from "@/components/executor/Header";
import { TemplatesModal } from "@/components/executor/Templates";
import { BookOpen, ChevronRight, Settings2 } from "lucide-react";
import SearchBar from "@/components/executor/SearchBar";
import useCodeExecution  from "@/lib/Polling";
import { StockDataResponse } from "@/lib/types";
import Result from "@/components/results/Result"


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
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [instrument, setInstrument] = useState<StockDataResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const {executeCode, isLoading, result, error} = useCodeExecution();

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
    // Scroll to results after a small delay to ensure component is rendered
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Header
        onRunStrategy={handleRunStrategy}
        onShowTemplates={() => setShowTemplates(true)}
      />

      <div className="flex-1 flex mt-16">
        <div className="flex-1 p-4 min-w-0">
          <div className="w-full h-full  bg-card/80 backdrop-blur-xl overflow-hidden shadow-lg">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown} />

        <div
          style={{ width: showParameters ? panelWidth : 0 }}
          className={`border-l border-border bg-card/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${
            showParameters ? "translate-x-0" : "translate-x-full"
          } ${isResizing ? "transition-none" : ""}`}
        >
          <div className="h-12 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center">
              <Settings2 className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Parameters</span>
            </div>
            <button
              onClick={() => setShowParameters(!showParameters)}
              className="hover:bg-accent/50 p-1 rounded-lg transition-colors"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${showParameters ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Instrument
                </label>
                <SearchBar
                  onSelectItem={setInstrument}
                  selectedItem={instrument}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Time Period
                </label>
                <select className="w-full h-10 px-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                  <option>Last 1 Year</option>
                  <option>Last 2 Years</option>
                  <option>Last 5 Years</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Initial Capital
                </label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  placeholder="Enter amount"
                  defaultValue={100000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
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

      {/* Results Section */}
      <div ref={resultRef} className="w-full">
        {(isLoading || result) && (
          <Result 
            data={result ? JSON.parse(result.stdout).results.loss_cutting : null} 
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
