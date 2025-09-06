import { useState, useMemo } from "react";
import { BACKEND_URL } from "@/lib/config";

interface ExecutionResult {
  exit_code: number;
  stdout: string;
  stderr: string;
}

interface ParsedResponse {
  error?: string;
  warnings?: string[] | null;
  results?: {
    loss_cutting?: any;
  };
}

 

const useCodeExecution = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedResult = useMemo(() => {
    if (!result?.stdout) return null;

    try {
      const parsed: ParsedResponse = JSON.parse(result.stdout);

      if (parsed.error || result.exit_code !== 0) {
        return null;
      }

      if (!parsed.results?.loss_cutting) {
        console.error('Unexpected response structure:', parsed);
        return null;
      }

      return parsed.results.loss_cutting;
    } catch (e) {
      console.error('Failed to parse result:', e);
      return null;
    }
  }, [result]);

  async function executeCode(
    code: string, 
    name: string, 
    startDate: string, 
    endDate: string,
    initialCapital: number,
    investmentPerTrade: number
  ) {
    try {
      setResult(null);
      setError(null);
      setIsLoading(true);

      const response = await fetch(`${BACKEND_URL}engine/execute/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backtest: {
            code,
            name,
            range: {
              from: startDate,
              to: endDate,
            },
            params: {
              initialCapital,
              investmentPerTrade,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { task_id, status_url } = await response.json();
      console.log(`Task ID: ${task_id}`);

      await pollTaskStatus(status_url); 
    } catch (err: any) {
      handleError(err);
    }
  }

  const handleError = (err: Error) => {
    setIsLoading(false);
    setError(err.message || "An unknown error occurred");
    setResult({
      exit_code: 1,
      stdout: JSON.stringify({ 
        error: err.message,
        warnings: null 
      }),
      stderr: err.stack || "No stack trace available"
    });
  };

  async function pollTaskStatus(status_url: string) {
    const poll_url = `https://backdrop-api.muneerdev.me${status_url}`;
    const POLLING_INTERVAL = 1000; // 1 second

    while (true) {
      try {
        const response = await fetch(poll_url);

        if (!response.ok) {
          throw new Error(`Failed to poll task status: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "completed") {
          setResult(data.result);
          setIsLoading(false);
          return;
        } else if (data.status === "error") {
          handleError(new Error(data.error || "Execution failed"));
          return;
        }

        console.log(`Task status: ${data.status}`);
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
      } catch (err: any) {
        handleError(err);
        return;
      }
    }
  }

  return {
    executeCode,
    isLoading,
    result,
    error,
    parsedResult,
  };
};

export default useCodeExecution;
