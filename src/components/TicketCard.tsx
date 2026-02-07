import { ExternalLink, GitCommit, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { cn, getClassificationColor, getClassificationLabel, truncate } from '../lib/utils';

interface TicketCardProps {
  ticket: {
    key: string;
    title: string;
    status: string;
    url: string;
    commits_count: number;
    time_logged_seconds: number;
    time_logged_display: string;
    comments_count?: number;
    status_changes?: Array<{
      from: string;
      to: string;
      at: string;
    }>;
    tags?: string[];
    analysis?: {
      classification: string;
    };
  };
  showDetails?: boolean;
  className?: string;
}

export default function TicketCard({ ticket, showDetails = false, className }: TicketCardProps) {
  const classification = ticket.analysis?.classification || 'normal';

  return (
    <div className={cn('card-hover p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={ticket.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              {ticket.key}
            </a>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              ticket.status.toLowerCase().includes('done') || ticket.status.toLowerCase().includes('closed')
                ? 'bg-emerald-500/20 text-emerald-400'
                : ticket.status.toLowerCase().includes('progress')
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-dark-600 text-dark-300'
            )}>
              {ticket.status}
            </span>
            {ticket.tags?.includes('non-code-activity') && (
              <span className="badge-accent text-xs">Non-code</span>
            )}
          </div>
          <h3 className="text-dark-100 font-medium mb-3">
            {truncate(ticket.title, 80)}
          </h3>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-dark-400">
              <GitCommit className="w-4 h-4" />
              <span>{ticket.commits_count} commits</span>
            </div>
            <div className="flex items-center gap-1.5 text-dark-400">
              <Clock className="w-4 h-4" />
              <span>{ticket.time_logged_display}</span>
            </div>
            {ticket.comments_count !== undefined && ticket.comments_count > 0 && (
              <div className="flex items-center gap-1.5 text-dark-400">
                <MessageSquare className="w-4 h-4" />
                <span>{ticket.comments_count}</span>
              </div>
            )}
            {classification !== 'normal' && (
              <span className={cn('text-xs font-medium', getClassificationColor(classification))}>
                {getClassificationLabel(classification)}
              </span>
            )}
          </div>
        </div>
        
        <a
          href={ticket.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {showDetails && ticket.status_changes && ticket.status_changes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-700/50">
          <p className="text-xs text-dark-400 mb-2">Status Changes</p>
          <div className="space-y-1">
            {ticket.status_changes.map((change, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-dark-400">{change.from}</span>
                <ArrowRight className="w-3 h-3 text-dark-500" />
                <span className="text-primary-400">{change.to}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
