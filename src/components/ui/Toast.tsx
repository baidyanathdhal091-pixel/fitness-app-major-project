import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgClasses = {
    success: 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800',
    error: 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-800',
    info: 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className={`fixed bottom-24 md:bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border-2 ${bgClasses[type]}`}
        >
          {icons[type]}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
