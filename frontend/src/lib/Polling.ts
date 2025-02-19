export async function executeCode(code: string, name: string) {
  try {
    const response = await fetch("http://localhost:8001/engine/execute/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "backtest": { code, name } }),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute code: ${response.statusText}`);
    }

    const { task_id, status_url } = await response.json();
    console.log(`Task ID: ${task_id}`);

    return await pollTaskStatus(status_url);
  } catch (error) { }
}

async function pollTaskStatus(status_url: string) {
  const poll_url = `http://localhost:8001${status_url}`;

  while (true) {
    const response = await fetch(poll_url);

    if (!response.ok) {
      throw new Error(`Failed to poll task status: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.status === "completed") {
      return data.result;
    }else if( data.status === "error" ){
      return data.error;
    } else {
      console.log(`Task status: ${data}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
