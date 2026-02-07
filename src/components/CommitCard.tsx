import { GitCommit, ExternalLink, AlertTriangle } from 'lucide-react';
import { cn, formatDate, truncate } from '../lib/utils';

interface CommitCardProps {
  commit: {
    sha: string;
    message: string;
    committed_at: string;
    url: string;
    repository_name?: string;
    repository?: string;
    ticket_key?: string | null;
    is_unlinked?: boolean;
  };
  showRepository?: boolean;
  className?: string;
}

export default function CommitCard({ commit, showRepository = true, className }: CommitCardProps) {
  const isUnlinked = commit.is_unlinked || !commit.ticket_key;
  const repoName = commit.repository_name || commit.repository;

  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-xl border transition-colors',
      isUnlinked 
        ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30' 
        : 'bg-dark-800/50 border-dark-700/50 hover:border-dark-600',
      className
    )}>
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        isUnlinked ? 'bg-amber-500/20' : 'bg-primary-500/20'
      )}>
        {isUnlinked ? (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        ) : (
          <GitCommit className="w-4 h-4 text-primary-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <code className="text-xs font-mono text-dark-300 bg-dark-700 px-2 py-0.5 rounded">
            {commit.sha.slice(0, 7)}
          </code>
          {isUnlinked && (
            <span className="badge-warning text-xs">Unlinked</span>
          )}
          {commit.ticket_key && (
            <span className="badge-primary text-xs">{commit.ticket_key}</span>
          )}
        </div>
        
        <p className="text-sm text-dark-200 mb-2">
          {truncate(commit.message, 100)}
        </p>
        
        <div className="flex items-center gap-3 text-xs text-dark-400">
          {showRepository && repoName && (
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" />
              {repoName}
            </span>
          )}
          <span>{formatDate(commit.committed_at, 'MMM d, h:mm a')}</span>
        </div>
      </div>
      
      <a
        href={commit.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
