import { ChartDataPoint } from "../lib/types";

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
    
    const maxDrawdown = Math.abs(Math.min(...values));
    if (maxDrawdown <= 0) return [0];
    
    const range = maxDrawdown;
    let step = Math.ceil(range / 5);
    step = Math.ceil(step / 5) * 5;
    
    const ticks = [0];
    let currentTick = -step;
    
    const maxTicks = 20;
    while (Math.abs(currentTick) <= maxDrawdown && ticks.length < maxTicks) {
      ticks.push(currentTick);
      currentTick -= step;
    }
    
    if (maxDrawdown > Math.abs(ticks[ticks.length - 1]) && 
        (maxDrawdown - Math.abs(ticks[ticks.length - 1])) > step * 0.3) {
      ticks.push(-Math.ceil(maxDrawdown));
    }
    
    return ticks;
  },

  calculateDateTicks: (data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return { ticks: [], format: 'dd/mm' };
    
    const dates = data.map(d => new Date(d.date));
    const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let format: 'dd/mm' | 'mm/yy' = 'dd/mm';
    if (daysDiff > 365) {
      format = 'mm/yy';
    }
    
    const ticks = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate.getTime() + (i * (endDate.getTime() - startDate.getTime())) / 4);      ticks.push(date);
    }
    
    return { ticks, format };
  }
}; 