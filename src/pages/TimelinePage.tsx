import { useState, useEffect } from 'react';
import { GitCommit, Filter, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { getCurrentWeekRange, toISOString, formatDate } from '../lib/utils';
import DateRangePicker from '../components/DateRangePicker';
import CommitCard from '../components/CommitCard';
import { LoadingPage } from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

export default function TimelinePage() {
  const [dateRange, setDateRange] = useState(getCurrentWeekRange());
  const [commits, setCommits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'linked' | 'unlinked'>('all');

  const fetchCommits = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        since: toISOString(dateRange.start),
        until: toISOString(dateRange.end),
      };
      if (filter === 'unlinked') {
        params.unlinked = true;
      }
      const data = await api.getCommits(params);
      setCommits(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch commits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await api.syncCommits(toISOString(dateRange.start), toISOString(dateRange.end));
      await fetchCommits();
    } catch (error) {
      console.error('Failed to sync commits:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, [dateRange, filter]);

  const filteredCommits = commits.filter((commit) => {
    if (filter === 'all') return true;
    if (filter === 'linked') return !commit.is_unlinked && commit.ticket_key;
    if (filter === 'unlinked') return commit.is_unlinked || !commit.ticket_key;
    return true;
  });

  // Group commits by date
  const groupedCommits = filteredCommits.reduce((acc, commit) => {
    const date = formatDate(commit.committed_at, 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(commit);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedCommits).sort((a, b) => b.localeCompare(a));

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Timeline</h1>
          <p className="text-dark-400">
            Your commit history for {formatDate(dateRange.start)} – {formatDate(dateRange.end)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={(start, end) => setDateRange({ start, end })}
          />
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-secondary"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-dark-400" />
        <div className="flex bg-dark-800 rounded-lg p-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'linked', label: 'Linked' },
            { value: 'unlinked', label: 'Unlinked' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === option.value
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-400 hover:text-dark-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-dark-400 ml-4">
          {filteredCommits.length} commits
        </span>
      </div>

      {/* Timeline */}
      {sortedDates.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <h3 className="font-semibold text-dark-200">
                  {formatDate(date, 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="flex-1 h-px bg-dark-700" />
                <span className="text-sm text-dark-400">
                  {groupedCommits[date].length} commits
                </span>
              </div>
              <div className="ml-6 pl-6 border-l border-dark-700 space-y-3">
                {groupedCommits[date].map((commit: any) => (
                  <CommitCard key={commit.sha} commit={commit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <GitCommit className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No commits found for this date range</p>
          <p className="text-sm text-dark-500 mt-1">
            Try syncing data or selecting a different date range
          </p>
        </div>
      )}
    </div>
  );
}
