import { useState } from "react";

function printKeys(obj: Record<string, any>, prefix: string = "") {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      console.log(newKey); // Print the key

      if (typeof obj[key] === "object" && obj[key] !== null) {
        printKeys(obj[key], newKey); // Recursively call for nested objects
      }
    }
  }
}

// Example Object
const nestedObject = {
  name: "Alice",
  details: {
    age: 25,
    address: {
      city: "New York",
      zip: 10001
    },
  },
  hobbies: ["reading", "gaming"],
};

// Call function
printKeys(nestedObject);


const useCodeExecution = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function executeCode(code: string, name: string) {
    try {
      setResult(null);
      setError(null);
      setIsLoading(true);

      const response = await fetch("http://localhost:8001/engine/execute/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backtest: { code, name } }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute code: ${response.statusText}`);
      }

      const { task_id, status_url } = await response.json();
      console.log(`Task ID: ${task_id}`);

      await pollTaskStatus(status_url); // Only calling it now, no need to return anything
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "An unknown error occurred");
    }
  }

  async function pollTaskStatus(status_url: string) {
    const poll_url = `http://localhost:8001${status_url}`;

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
          setError(data.error || "Execution failed");
          setIsLoading(false);
          return;
        } else {
          console.log(`Task status: ${data.status}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (err: any) {
        setError(err.message || "Polling error");
        setIsLoading(false);
        return;
      }
    }
  }

  return {
    executeCode,
    isLoading,
    result,
    error,
  };
};

export default useCodeExecution;
