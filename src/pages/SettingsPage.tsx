import { useState, useEffect } from 'react';
import { 
  Github, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle,
  Folder,
  FolderCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

// Jira icon component
const JiraIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 23.013 0z"/>
  </svg>
);

interface Repository {
  id: string;
  name: string;
  full_name: string;
  is_tracked: boolean;
  is_private: boolean;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  is_tracked: boolean;
}

export default function SettingsPage() {
  const { githubConnected, jiraConnected, setGithubConnected, setJiraConnected } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingRepos, setIsSyncingRepos] = useState(false);
  const [isSyncingProjects, setIsSyncingProjects] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [repos, projects] = await Promise.all([
        githubConnected ? api.getRepositories().catch(() => ({ results: [] })) : { results: [] },
        jiraConnected ? api.getJiraProjects().catch(() => ({ results: [] })) : { results: [] },
      ]);
      setRepositories(repos.results || repos || []);
      setJiraProjects(projects.results || projects || []);
    } catch (error) {
      console.error('Failed to fetch settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check for OAuth callbacks
    const githubStatus = searchParams.get('github');
    const jiraStatus = searchParams.get('jira');
    const error = searchParams.get('error');

    if (githubStatus === 'connected') {
      setMessage({ type: 'success', text: 'GitHub connected successfully!' });
      setGithubConnected(true);
      // Clear the URL params
      setSearchParams({});
    } else if (jiraStatus === 'connected') {
      setMessage({ type: 'success', text: 'Jira connected successfully!' });
      setJiraConnected(true);
      // Clear the URL params
      setSearchParams({});
    } else if (error) {
      setMessage({ type: 'error', text: `Connection failed: ${error}` });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, setGithubConnected, setJiraConnected]);

  const handleConnectGitHub = async () => {
    try {
      const authUrl = await api.getGitHubAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to initiate GitHub connection' });
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      await api.disconnectGitHub();
      setGithubConnected(false);
      setRepositories([]);
      setMessage({ type: 'success', text: 'GitHub disconnected' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect GitHub' });
    }
  };

  const handleConnectJira = async () => {
    try {
      const authUrl = await api.getJiraAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to initiate Jira connection' });
    }
  };

  const handleDisconnectJira = async () => {
    try {
      await api.disconnectJira();
      setJiraConnected(false);
      setJiraProjects([]);
      setMessage({ type: 'success', text: 'Jira disconnected' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect Jira' });
    }
  };

  const handleSyncRepositories = async () => {
    try {
      setIsSyncingRepos(true);
      const result = await api.syncRepositories();
      setRepositories(result.repositories || []);
      setMessage({ type: 'success', text: `Synced ${result.repositories?.length || 0} repositories` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to sync repositories' });
    } finally {
      setIsSyncingRepos(false);
    }
  };

  const handleSyncProjects = async () => {
    try {
      setIsSyncingProjects(true);
      const result = await api.syncJiraProjects();
      setJiraProjects(result.projects || []);
      setMessage({ type: 'success', text: `Synced ${result.projects?.length || 0} projects` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to sync projects' });
    } finally {
      setIsSyncingProjects(false);
    }
  };

  const handleToggleRepository = async (repoId: string) => {
    try {
      const updated = await api.toggleRepositoryTracking(repoId);
      setRepositories((prev) =>
        prev.map((r) => (r.id === repoId ? { ...r, is_tracked: updated.is_tracked } : r))
      );
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update repository' });
    }
  };

  const handleToggleProject = async (projectId: string) => {
    try {
      const updated = await api.toggleProjectTracking(projectId);
      setJiraProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_tracked: updated.is_tracked } : p))
      );
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update project' });
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Settings</h1>
      <p className="text-dark-400 mb-8">Connect your GitHub and Jira accounts to start tracking</p>

      {message && (
        <div
          className={cn(
            'mb-6 p-4 rounded-xl flex items-center gap-3',
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          )}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-auto p-1 hover:bg-dark-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* GitHub Integration */}
      <section className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">GitHub</h2>
              <p className="text-sm text-dark-400">Connect to track commits and PRs</p>
            </div>
          </div>
          {githubConnected ? (
            <div className="flex items-center gap-3">
              <span className="badge-success flex items-center gap-1">
                <Check className="w-3 h-3" /> Connected
              </span>
              <button onClick={handleDisconnectGitHub} className="btn-ghost text-rose-400">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={handleConnectGitHub} className="btn-primary">
              <Github className="w-4 h-4 mr-2" />
              Connect GitHub
            </button>
          )}
        </div>

        {githubConnected && (
          <div className="border-t border-dark-700/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-dark-200">Repositories</h3>
              <button
                onClick={handleSyncRepositories}
                disabled={isSyncingRepos}
                className="btn-ghost text-sm"
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', isSyncingRepos && 'animate-spin')} />
                {isSyncingRepos ? 'Syncing...' : 'Sync'}
              </button>
            </div>

            {repositories.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {repo.is_tracked ? (
                        <FolderCheck className="w-4 h-4 text-primary-400" />
                      ) : (
                        <Folder className="w-4 h-4 text-dark-400" />
                      )}
                      <span className="text-dark-200">{repo.full_name}</span>
                      {repo.is_private && (
                        <span className="badge text-xs bg-dark-700 text-dark-400">Private</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleRepository(repo.id)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                        repo.is_tracked
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                      )}
                    >
                      {repo.is_tracked ? 'Tracking' : 'Track'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-sm">
                No repositories found. Click "Sync" to fetch your repositories.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Jira Integration */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0052CC] flex items-center justify-center">
              <JiraIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Jira</h2>
              <p className="text-sm text-dark-400">Connect to track tickets and worklogs</p>
            </div>
          </div>
          {jiraConnected ? (
            <div className="flex items-center gap-3">
              <span className="badge-success flex items-center gap-1">
                <Check className="w-3 h-3" /> Connected
              </span>
              <button onClick={handleDisconnectJira} className="btn-ghost text-rose-400">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={handleConnectJira} className="btn-primary">
              <JiraIcon className="w-4 h-4 mr-2" />
              Connect Jira
            </button>
          )}
        </div>

        {jiraConnected && (
          <div className="border-t border-dark-700/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-dark-200">Projects</h3>
              <button
                onClick={handleSyncProjects}
                disabled={isSyncingProjects}
                className="btn-ghost text-sm"
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', isSyncingProjects && 'animate-spin')} />
                {isSyncingProjects ? 'Syncing...' : 'Sync'}
              </button>
            </div>

            {jiraProjects.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {jiraProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-primary-400">{project.key}</span>
                      <span className="text-dark-200">{project.name}</span>
                    </div>
                    <button
                      onClick={() => handleToggleProject(project.id)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                        project.is_tracked
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                      )}
                    >
                      {project.is_tracked ? 'Tracking' : 'Track'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-sm">
                No projects found. Click "Sync" to fetch your projects.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
