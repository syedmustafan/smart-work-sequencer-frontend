import { useState, useEffect } from 'react';
import { RefreshCw, Check, Filter } from 'lucide-react';
import api from '../lib/api';
import { getCurrentWeekRange, toISOString, formatDate } from '../lib/utils';
import DateRangePicker from '../components/DateRangePicker';
import HygieneAlertComponent from '../components/HygieneAlert';
import { LoadingPage } from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

export default function HygienePage() {
  const [dateRange, setDateRange] = useState(getCurrentWeekRange());
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, alertsData] = await Promise.all([
        api.getHygieneSummary(toISOString(dateRange.start), toISOString(dateRange.end)),
        api.getHygieneAlerts({ resolved: false }),
      ]);
      setSummary(summaryData);
      setAlerts(alertsData.results || alertsData || []);
    } catch (error) {
      console.error('Failed to fetch hygiene data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      await api.detectHygieneIssues(toISOString(dateRange.start), toISOString(dateRange.end));
      await fetchData();
    } catch (error) {
      console.error('Failed to detect issues:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await api.resolveAlerts([alertId]);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const alertTypes = [
    { value: 'all', label: 'All' },
    { value: 'commit_no_ticket', label: 'Unlinked Commits' },
    { value: 'status_no_commit', label: 'Non-Code Activity' },
    { value: 'time_no_code', label: 'Time No Code' },
    { value: 'stalled_ticket', label: 'Stalled Tickets' },
  ];

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter((a) => a.alert_type === filter);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Hygiene Alerts</h1>
          <p className="text-dark-400">
            Track and resolve workflow issues for {formatDate(dateRange.start)} – {formatDate(dateRange.end)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={(start, end) => setDateRange({ start, end })}
          />
          <button
            onClick={handleDetect}
            disabled={isDetecting}
            className="btn-primary"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isDetecting && 'animate-spin')} />
            {isDetecting ? 'Detecting...' : 'Detect Issues'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-3xl font-bold text-amber-400">{summary.total_alerts || 0}</p>
            <p className="text-sm text-dark-400">Total Alerts</p>
          </div>
          <div className="card p-5">
            <p className="text-3xl font-bold text-rose-400">
              {summary.by_type?.commit_no_ticket || 0}
            </p>
            <p className="text-sm text-dark-400">Unlinked Commits</p>
          </div>
          <div className="card p-5">
            <p className="text-3xl font-bold text-primary-400">
              {summary.by_type?.status_no_commit || 0}
            </p>
            <p className="text-sm text-dark-400">Non-Code Activity</p>
          </div>
          <div className="card p-5">
            <p className="text-3xl font-bold text-amber-400">
              {summary.by_type?.stalled_ticket || 0}
            </p>
            <p className="text-sm text-dark-400">Stalled Tickets</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-dark-400" />
        <div className="flex bg-dark-800 rounded-lg p-1 flex-wrap gap-1">
          {alertTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === type.value
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-dark-400 hover:text-dark-200'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <HygieneAlertComponent
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-dark-400">No hygiene issues detected for this date range</p>
          <p className="text-sm text-dark-500 mt-1">
            Keep up the good work! Your workflow is clean.
          </p>
        </div>
      )}
    </div>
  );
}
