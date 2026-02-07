import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Plus } from 'lucide-react';
import api from '../lib/api';
import { formatDate, getLastWeekRange, toISOString } from '../lib/utils';
import { LoadingPage } from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await api.getWeeklyReports();
      setReports(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const { start, end } = getLastWeekRange();
      const report = await api.createWeeklyReport(toISOString(start), toISOString(end));
      setReports((prev) => [report, ...prev]);
      setSelectedReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const report = await api.getWeeklyReportDetail(reportId);
      setSelectedReport(report);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport?.markdown_report) return;
    
    const blob = new Blob([selectedReport.markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-report-${selectedReport.start_date}-${selectedReport.end_date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Weekly Reports</h1>
          <p className="text-dark-400">View and generate your work reports</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Last Week'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h3 className="font-semibold text-dark-200 mb-4 px-2">Past Reports</h3>
            {reports.length > 0 ? (
              <div className="space-y-2">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleViewReport(report.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl transition-all',
                      selectedReport?.id === report.id
                        ? 'bg-primary-500/10 border border-primary-500/30'
                        : 'hover:bg-dark-800'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-200 font-medium">
                        {formatDate(report.start_date)} – {formatDate(report.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-dark-400">
                      <span>{report.total_tickets} tickets</span>
                      <span>{report.total_commits} commits</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">No reports yet</p>
                <p className="text-dark-500 text-xs mt-1">
                  Generate your first weekly report
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {formatDate(selectedReport.start_date)} – {formatDate(selectedReport.end_date)}
                  </h2>
                  <p className="text-sm text-dark-400">
                    Generated {formatDate(selectedReport.created_at, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <button onClick={handleDownloadMarkdown} className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download MD
                </button>
              </div>

              {/* Summary */}
              <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl mb-6">
                <p className="text-dark-200">{selectedReport.summary_text}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary-400">
                    {selectedReport.total_tickets}
                  </p>
                  <p className="text-xs text-dark-400">Tickets</p>
                </div>
                <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-accent-400">
                    {selectedReport.total_commits}
                  </p>
                  <p className="text-xs text-dark-400">Commits</p>
                </div>
                <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {selectedReport.tickets_completed}
                  </p>
                  <p className="text-xs text-dark-400">Completed</p>
                </div>
              </div>

              {/* Markdown Preview */}
              {selectedReport.markdown_report && (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="p-4 bg-dark-800/50 rounded-xl overflow-x-auto">
                    <pre className="text-xs text-dark-300 whitespace-pre-wrap font-mono">
                      {selectedReport.markdown_report}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400">Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
