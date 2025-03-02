import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}) => {
//   if (Math.abs(value) >= 1000000) {
//     return new Intl.NumberFormat('en-IN', {
//       ...options,
//       notation: 'compact',
//       compactDisplay: 'short',
//       maximumFractionDigits: 1
//     }).format(value);
//   }
//   return new Intl.NumberFormat('en-US', options).format(value);
// };