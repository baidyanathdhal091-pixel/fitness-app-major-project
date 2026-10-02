import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  unit?: string;
  children?: ReactNode;
}

export default function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = '#10b981',
  trackColor = 'currentColor',
  label,
  sublabel,
  unit,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(1, max > 0 ? value / max : 0);
  const offset = circumference - percentage * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="text-slate-200 dark:text-slate-700">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {label && (
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {sublabel}
              </span>
            )}
            {unit && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {unit}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
