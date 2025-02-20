import { AlertCircle, X } from 'lucide-react';

interface FieldError {
  field: string;
  message: string;
}

interface ErrorDisplayProps {
  errors: FieldError[];
  className?: string;
  onClose?: () => void;
  field?: string;
}

export const ErrorDisplay = ({ errors, className = '', onClose, field }: ErrorDisplayProps) => {
  if (!errors || errors.length === 0) return null;

  // Filter errors for specific field if provided
  const filteredErrors = field ? errors.filter(e => e.field === field) : errors;

  if (filteredErrors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-medium">Please fix the following issues:</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 -mt-1 -mr-1 text-red-700 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
            aria-label="Close error message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <ul className="mt-2 ml-6 list-disc space-y-1">
        {filteredErrors.map((error, index) => (
          <li key={index} className="text-sm text-red-700">
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
};