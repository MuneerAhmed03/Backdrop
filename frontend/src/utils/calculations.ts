interface ChartDataPoint {
  date: string;
  equity: number;
  drawdown: number;
}

export const safeCalculations = {
  getMinMax: (data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return { min: 0, max: 0 };
    return data.reduce(
      (acc, d) => ({
        min: Math.min(acc.min, d.equity),
        max: Math.max(acc.max, d.equity),
      }),
      { min: data[0].equity, max: data[0].equity }
    );
  },
  
  calculateDrawdownTicks: (values: number[]) => {
    if (!values || values.length === 0) return [0];
    const maxDrawdown = Math.max(...values);
    if (maxDrawdown <= 0) return [0];
    
    const range = maxDrawdown;
    let step = Math.ceil(range / 5);
    step = Math.ceil(step / 5) * 5;
    
    const ticks = [0];
    let currentTick = step;
    
    const maxTicks = 20;
    while (currentTick <= maxDrawdown && ticks.length < maxTicks) {
      ticks.push(currentTick);
      currentTick += step;
    }
    
    if (maxDrawdown > ticks[ticks.length - 1] && 
        (maxDrawdown - ticks[ticks.length - 1]) > step * 0.3) {
      ticks.push(Math.ceil(maxDrawdown));
    }
    
    return ticks;
  }
}; 