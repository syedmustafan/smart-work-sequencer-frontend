import { AlertTriangle, Info, AlertCircle, Check } from 'lucide-react';
import { cn, getAlertTypeLabel, getAlertSeverityColor } from '../lib/utils';

interface HygieneAlertProps {
  alert: {
    id: string;
    alert_type: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string;
    ticket_key?: string | null;
    commit_sha?: string | null;
    is_resolved: boolean;
  };
  onResolve?: (id: string) => void;
  className?: string;
}

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const severityColors = {
  info: 'border-primary-500/30 bg-primary-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  critical: 'border-rose-500/30 bg-rose-500/5',
};

const iconColors = {
  info: 'text-primary-400 bg-primary-500/20',
  warning: 'text-amber-400 bg-amber-500/20',
  critical: 'text-rose-400 bg-rose-500/20',
};

export default function HygieneAlert({ alert, onResolve, className }: HygieneAlertProps) {
  const Icon = severityIcons[alert.severity as keyof typeof severityIcons] || AlertTriangle;
  const borderBg = severityColors[alert.severity as keyof typeof severityColors] || severityColors.warning;
  const iconColor = iconColors[alert.severity as keyof typeof iconColors] || iconColors.warning;

  return (
    <div className={cn(
      'p-4 rounded-xl border transition-all',
      borderBg,
      alert.is_resolved && 'opacity-50',
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-dark-100">{alert.title}</h4>
            <span className={cn('badge text-xs', getAlertSeverityColor(alert.severity))}>
              {getAlertTypeLabel(alert.alert_type as any)}
            </span>
          </div>
          
          <p className="text-sm text-dark-400 mb-3">{alert.description}</p>
          
          <div className="flex items-center gap-4">
            {alert.ticket_key && (
              <span className="text-xs font-mono text-primary-400">{alert.ticket_key}</span>
            )}
            {alert.commit_sha && (
              <code className="text-xs font-mono text-dark-400">{alert.commit_sha}</code>
            )}
          </div>
          
          <div className="mt-3 p-3 bg-dark-800/50 rounded-lg">
            <p className="text-xs text-dark-300">
              <span className="text-dark-400 font-medium">💡 Recommendation:</span> {alert.recommendation}
            </p>
          </div>
        </div>

        {!alert.is_resolved && onResolve && (
          <button
            onClick={() => onResolve(alert.id)}
            className="p-2 text-dark-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="Mark as resolved"
          >
            <Check className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
