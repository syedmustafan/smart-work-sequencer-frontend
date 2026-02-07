import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, startOfWeek, endOfWeek, subWeeks, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatTime(seconds: number): string {
  if (seconds === 0) return '0h';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

export function getCurrentWeekRange() {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  return { start, end };
}

export function getLastWeekRange() {
  const now = new Date();
  const lastWeek = subWeeks(now, 1);
  const start = startOfWeek(lastWeek, { weekStartsOn: 1 });
  const end = endOfWeek(lastWeek, { weekStartsOn: 1 });
  return { start, end };
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const p = plural || `${singular}s`;
  return count === 1 ? singular : p;
}

export type AlertType = 
  | 'commit_no_ticket' 
  | 'status_no_commit' 
  | 'time_no_code' 
  | 'stalled_ticket'
  | 'high_effort_low_output';

export function getAlertTypeLabel(type: AlertType): string {
  const labels: Record<AlertType, string> = {
    commit_no_ticket: 'Unlinked Commit',
    status_no_commit: 'Non-Code Activity',
    time_no_code: 'Time Without Code',
    stalled_ticket: 'Stalled Ticket',
    high_effort_low_output: 'High Effort, Low Output',
  };
  return labels[type] || type;
}

export function getAlertSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    info: 'badge-primary',
    warning: 'badge-warning',
    critical: 'badge-danger',
  };
  return colors[severity] || 'badge-primary';
}

export function getClassificationColor(classification: string): string {
  const colors: Record<string, string> = {
    fast_win: 'text-emerald-400',
    high_effort_low_output: 'text-rose-400',
    stalled: 'text-amber-400',
    normal: 'text-dark-400',
  };
  return colors[classification] || 'text-dark-400';
}

export function getClassificationLabel(classification: string): string {
  const labels: Record<string, string> = {
    fast_win: '🚀 Fast Win',
    high_effort_low_output: '⚠️ High Effort',
    stalled: '🔄 Stalled',
    normal: 'Normal',
  };
  return labels[classification] || classification;
}
