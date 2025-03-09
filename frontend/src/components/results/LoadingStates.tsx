export const SkeletonCard = () => (
  <div className="metric-card animate-pulse motion-safe:[animation-duration:3s]">
    <div className="h-4 w-24 bg-gray-700/50 rounded mb-2"></div>
    <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
  </div>
);

export const SkeletonChart = () => (
  <div className="h-64 glassmorphism p-4 rounded-lg animate-pulse motion-safe:[animation-duration:3s]">
    <div className="w-full h-full bg-gray-700/50 rounded"></div>
  </div>
); 