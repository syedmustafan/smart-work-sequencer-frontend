import { type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  colorClass = 'from-primary-400 to-accent-400',
  className,
}: StatCardProps) {
  return (
    <div className={cn('stat-card group', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 mb-1">{label}</p>
          <p className={cn('text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent', colorClass)}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-dark-500">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity',
          colorClass.replace('from-', 'from-').replace('to-', '/20 to-') + '/20'
        )}>
          <Icon className={cn('w-6 h-6', colorClass.includes('primary') ? 'text-primary-400' : 'text-accent-400')} />
        </div>
      </div>
    </div>
  );
}
