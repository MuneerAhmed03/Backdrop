"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { CodeEditor } from "@/components/executor/CodeEditor";
import { Header } from "@/components/executor/Header";
import { TemplatesModal } from "@/components/executor/Templates";
import { BookOpen, ChevronRight, Settings2 } from "lucide-react";
import SearchBar from "@/components/executor/SearchBar";
import useCodeExecution  from "@/lib/Polling";
import { StockDataResponse } from "@/lib/types";
import Result from "@/components/results/Result"
import DatePicker from "@/components/results/DatePicker"
import DateRangePicker from "@/components/results/DatePicker";
import { DateRange } from "react-day-picker";


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
  const [editorWidth, setEditorWidth] = useState(() => Math.floor(window.innerWidth * 0.67));
  const [isResizing, setIsResizing] = useState(false);
  const [instrument, setInstrument] = useState<StockDataResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [strategy,setStrategy]=useState<string>("Risk Reduction");
  const {executeCode, isLoading, result, error} = useCodeExecution();
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1); 
    
    return {
      from: firstDayOfYear,
      to: oneWeekAgo,
    };
  });
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [investmentPerTrade, setInvestmentPerTrade] = useState<number>(10000);

  // Calculate parameter pane width based on editor width
  const parameterPaneWidth = useMemo(() => {
    // Ensure minimum width of 33% of window width for parameter pane
    const minParamWidth = Math.floor(window.innerWidth * 0.33);
    const calculatedWidth = window.innerWidth - editorWidth - 1;
    return Math.max(calculatedWidth, minParamWidth);
  }, [editorWidth]);

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

      const minWidth = Math.floor(window.innerWidth * 0.5); // 50% of screen width
      const maxWidth = Math.floor(window.innerWidth * 0.67); // ~67% of screen width
      const newWidth = e.clientX;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setEditorWidth(newWidth);
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
    if (dateRange.from && dateRange.to) {
      executeCode(
        code, 
        instrument?.source_file || "20microns.csv", 
        dateRange.from.toISOString().split('T')[0],
        dateRange.to.toISOString().split('T')[0],
        initialCapital,
        investmentPerTrade
      );
    }
    
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
      <div className="flex-1 flex">
        <div 
          style={{ width: editorWidth }} 
          className="p-4 min-w-[50%] max-w-[67%]"
        >
          <div className="w-full h-full bg-card/80 backdrop-blur-xl overflow-hidden shadow-lg">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        <div 
          className="w-1 hover:bg-accent/50 cursor-col-resize relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-2 -right-2" />
          {/* Drag handle indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 flex flex-col justify-center items-center gap-1 pointer-events-none px-2">
            <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground group-hover:bg-accent" />
            <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground group-hover:bg-accent" />
            <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground group-hover:bg-accent" />
          </div>
        </div>

        <div
          style={{ width: showParameters ? parameterPaneWidth : 0 }}
          className={`flex-shrink-0 border-l border-border bg-card/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${
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
                <DateRangePicker onDateRangeChange={setDateRange} dateRange={dateRange}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Initial Capital
                </label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  placeholder="Enter amount"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">
                  Investment Per Trade
                </label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  placeholder="Enter amount"
                  value={investmentPerTrade}
                  onChange={(e) => setInvestmentPerTrade(Number(e.target.value))}
                  min={0}
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
            onStrategySelect={setStrategy}
          />
        )}
      </div>
    </div>
  );
}
