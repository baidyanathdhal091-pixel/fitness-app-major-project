import type { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  color?: string;
  bgColor?: string;
  children?: ReactNode;
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  sublabel,
  color = 'text-emerald-600 dark:text-emerald-400',
  bgColor = 'bg-emerald-50 dark:bg-emerald-900/20',
  children,
}: MetricCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {sublabel && (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {sublabel}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        {unit && <span className="text-sm text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {children}
    </div>
  );
}
