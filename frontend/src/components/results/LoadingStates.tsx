export const SkeletonCard = () => (
  <div className="glassmorphism p-4 rounded-lg animate-pulse">
    <div className="h-4 w-24 bg-muted rounded mb-2" />
    <div className="h-6 w-32 bg-muted rounded" />
  </div>
);

export const SkeletonChart = () => (
  <div className="glassmorphism h-64 p-4 rounded-lg animate-pulse">
    <div className="h-full w-full bg-muted rounded" />
  </div>
); 