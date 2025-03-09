import React from "react";

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-background text-foreground p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <h2 className="text-lg font-semibold text-red-500">Error Loading Results</h2>
        <p className="text-sm text-red-400">{error.message}</p>
      </div>
    </div>
  </div>
);

export class ResultErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
} 