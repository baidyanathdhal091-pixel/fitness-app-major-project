import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  label?: string;
  valueLabel?: string;
  icon?: React.ReactNode;
}

export default function ProgressBar({
  value,
  max,
  color = 'bg-emerald-500',
  height = 8,
  label,
  valueLabel,
  icon,
}: ProgressBarProps) {
  const percentage = Math.min(100, max > 0 ? (value / max) * 100 : 0);

  return (
    <div className="w-full">
      {(label || valueLabel) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            {icon}
            {label}
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {valueLabel}
          </span>
        </div>
      )}
      <div
        className="w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
