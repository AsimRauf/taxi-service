import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface SnackbarProps {
  message: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export const Snackbar = ({ message, isOpen, onClose, action }: SnackbarProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px] border border-gray-200">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-gray-700 flex-grow">{message}</p>
            {action && (
              <button
                onClick={action.onClick}
                className="px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-full"
              >
                {action.label}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};