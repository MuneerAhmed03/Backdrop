import { AlertTriangle } from "lucide-react";

interface ExecutionError {
  error?: string;
  warnings?: string[];
  stderr?: string;
  exit_code?: number;
}

interface ErrorDisplayProps {
  error: ExecutionError;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div className="min-h-[50vh] bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glassmorphism p-6 rounded-lg space-y-4 border-destructive/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-destructive mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-destructive">Execution Error</h2>
              {error.exit_code && (
                <p className="text-sm text-destructive/80">Exit Code: {error.exit_code}</p>
              )}
            </div>
          </div>

          {error.error && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-destructive mb-2">Error Message</h3>
              <pre className="neo-blur p-4 rounded-md text-sm text-destructive-foreground overflow-x-auto">
                {error.error}
              </pre>
            </div>
          )}

          {error.stderr && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-destructive mb-2">Standard Error Output</h3>
              <pre className="neo-blur p-4 rounded-md text-sm text-destructive-foreground overflow-x-auto whitespace-pre-wrap">
                {error.stderr}
              </pre>
            </div>
          )}

          {error.warnings && error.warnings.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Warnings</h3>
              <div className="neo-blur p-4 rounded-md space-y-2">
                {error.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 