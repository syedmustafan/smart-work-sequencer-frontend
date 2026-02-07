import { useState, useEffect } from 'react';
import { 
  GitCommit, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import api from '../lib/api';
import { getCurrentWeekRange, toISOString, formatDate } from '../lib/utils';
import DateRangePicker from '../components/DateRangePicker';
import StatCard from '../components/StatCard';
import TicketCard from '../components/TicketCard';
import { LoadingPage } from '../components/LoadingSpinner';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState(getCurrentWeekRange());
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (sync = false) => {
    try {
      if (sync) setIsSyncing(true);
      else setIsLoading(true);
      
      const data = await api.generateReport(
        toISOString(dateRange.start),
        toISOString(dateRange.end),
        sync
      );
      setReport(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load report');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchReport(false);
  }, [dateRange]);

  if (isLoading) {
    return <LoadingPage />;
  }

  const stats = report?.stats || {};
  const tickets = report?.tickets || [];
  const hygiene = report?.hygiene || {};

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Dashboard</h1>
          <p className="text-dark-400">
            Your work summary for {formatDate(dateRange.start)} – {formatDate(dateRange.end)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={(start, end) => setDateRange({ start, end })}
          />
          <button
            onClick={() => fetchReport(true)}
            disabled={isSyncing}
            className="btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
          {error}
        </div>
      )}

      {/* AI Summary */}
      {report?.summary && (
        <div className="card p-6 mb-8 border-primary-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100 mb-2 flex items-center gap-2">
                AI Summary
                <span className="badge-primary text-xs">GPT-4</span>
              </h3>
              <p className="text-dark-300 leading-relaxed">{report.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Tickets Worked"
          value={stats.total_tickets || 0}
          icon={Ticket}
          colorClass="from-primary-400 to-primary-500"
        />
        <StatCard
          label="Commits Made"
          value={stats.total_commits || 0}
          icon={GitCommit}
          colorClass="from-accent-400 to-accent-500"
        />
        <StatCard
          label="Tickets Completed"
          value={stats.tickets_completed || 0}
          icon={CheckCircle2}
          colorClass="from-emerald-400 to-emerald-500"
        />
        <StatCard
          label="Time Logged"
          value={stats.total_time_logged_display || '0h'}
          icon={Clock}
          colorClass="from-amber-400 to-amber-500"
        />
      </div>

      {/* Hygiene Overview */}
      {(stats.unlinked_commits > 0 || hygiene.total_alerts > 0) && (
        <div className="card p-6 mb-8 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-dark-100">Hygiene Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-800/50 rounded-xl">
              <p className="text-2xl font-bold text-amber-400">{stats.unlinked_commits || 0}</p>
              <p className="text-sm text-dark-400">Unlinked Commits</p>
            </div>
            <div className="p-4 bg-dark-800/50 rounded-xl">
              <p className="text-2xl font-bold text-amber-400">{stats.non_code_activities || 0}</p>
              <p className="text-sm text-dark-400">Non-Code Activities</p>
            </div>
            <div className="p-4 bg-dark-800/50 rounded-xl">
              <p className="text-2xl font-bold text-amber-400">{hygiene.total_alerts || 0}</p>
              <p className="text-sm text-dark-400">Total Alerts</p>
            </div>
          </div>
        </div>
      )}

      {/* Effort Analysis */}
      {report?.effort_analysis && (
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-dark-100">Effort Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-2xl font-bold text-emerald-400">
                {report.effort_analysis.summary?.fast_wins_count || 0}
              </p>
              <p className="text-sm text-dark-400">Fast Wins 🚀</p>
            </div>
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-2xl font-bold text-rose-400">
                {report.effort_analysis.summary?.high_effort_low_output_count || 0}
              </p>
              <p className="text-sm text-dark-400">High Effort ⚠️</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-2xl font-bold text-amber-400">
                {report.effort_analysis.summary?.stalled_count || 0}
              </p>
              <p className="text-sm text-dark-400">Stalled 🔄</p>
            </div>
            <div className="p-4 bg-dark-700/50 rounded-xl">
              <p className="text-2xl font-bold text-dark-300">
                {report.effort_analysis.summary?.normal_count || 0}
              </p>
              <p className="text-sm text-dark-400">Normal</p>
            </div>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-dark-100">Tickets ({tickets.length})</h3>
        </div>
        
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <TicketCard 
                key={ticket.id || ticket.key} 
                ticket={ticket}
                showDetails={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">No tickets found for this date range</p>
            <p className="text-sm text-dark-500 mt-1">
              Try syncing data or selecting a different date range
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
