export const formatters = {
  currency: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
  percent: new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 2 }),
  decimal: new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
};

export const formatIndianNumber = (value: number) => {
  if (value >= 1_00_00_000) {
    return (value / 1_00_00_000).toFixed(1).replace(/\.0$/, '') + 'Cr';
  } else if (value >= 1_00_000) {
    return (value / 1_00_000).toFixed(1).replace(/\.0$/, '') + 'L';
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return value.toString();
}; 