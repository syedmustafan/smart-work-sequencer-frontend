import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // OAuth - GitHub
  async getGitHubAuthUrl() {
    const { data } = await this.client.get('/auth/github/');
    return data.auth_url;
  }

  async disconnectGitHub() {
    localStorage.removeItem('github_connected');
    return { success: true };
  }

  // OAuth - Jira
  async getJiraAuthUrl() {
    const { data } = await this.client.get('/auth/jira/');
    return data.auth_url;
  }

  async disconnectJira() {
    localStorage.removeItem('jira_connected');
    return { success: true };
  }

  // GitHub Integration
  async getRepositories() {
    const { data } = await this.client.get('/integrations/github/repositories/');
    return data;
  }

  async syncRepositories() {
    const { data } = await this.client.post('/integrations/github/repositories/sync/');
    return data;
  }

  async toggleRepositoryTracking(repoId: string) {
    const { data } = await this.client.post(`/integrations/github/repositories/${repoId}/toggle/`);
    return data;
  }

  async syncCommits(since: string, until: string) {
    const { data } = await this.client.post('/integrations/github/commits/sync/', { since, until });
    return data;
  }

  async getCommits(params?: { since?: string; until?: string; repository?: string; unlinked?: boolean }) {
    const { data } = await this.client.get('/integrations/github/commits/', { params });
    return data;
  }

  // Jira Integration
  async getJiraProjects() {
    const { data } = await this.client.get('/integrations/jira/projects/');
    return data;
  }

  async syncJiraProjects() {
    const { data } = await this.client.post('/integrations/jira/projects/sync/');
    return data;
  }

  async toggleProjectTracking(projectId: string) {
    const { data } = await this.client.post(`/integrations/jira/projects/${projectId}/toggle/`);
    return data;
  }

  async syncJiraData(since: string, until: string, projectKeys?: string[]) {
    const { data } = await this.client.post('/integrations/jira/sync/', { since, until, project_keys: projectKeys });
    return data;
  }

  async getTickets(params?: { project?: string; status?: string; since?: string; until?: string }) {
    const { data } = await this.client.get('/integrations/jira/tickets/', { params });
    return data;
  }

  // Reports
  async generateReport(since: string, until: string, syncFirst = true) {
    const { data } = await this.client.post('/reports/generate/', { since, until, sync_first: syncFirst });
    return data;
  }

  async getWeeklyReports() {
    const { data } = await this.client.get('/reports/weekly/');
    return data;
  }

  async createWeeklyReport(since: string, until: string) {
    const { data } = await this.client.post('/reports/weekly/create/', { since, until });
    return data;
  }

  async getCurrentWeekReport() {
    const { data } = await this.client.get('/reports/weekly/current/');
    return data;
  }

  async getLastWeekReport() {
    const { data } = await this.client.get('/reports/weekly/last/');
    return data;
  }

  async getWeeklyReportDetail(id: string) {
    const { data } = await this.client.get(`/reports/weekly/${id}/`);
    return data;
  }

  // Analytics
  async getEffortAnalysis(since: string, until: string) {
    const { data } = await this.client.get('/reports/analytics/effort/', { params: { since, until } });
    return data;
  }

  // Hygiene
  async getHygieneAlerts(params?: { resolved?: boolean; type?: string; severity?: string }) {
    const { data } = await this.client.get('/reports/hygiene/', { params });
    return data;
  }

  async getHygieneSummary(since: string, until: string) {
    const { data } = await this.client.get('/reports/hygiene/summary/', { params: { since, until } });
    return data;
  }

  async detectHygieneIssues(since: string, until: string) {
    const { data } = await this.client.post('/reports/hygiene/detect/', { since, until });
    return data;
  }

  async resolveAlerts(alertIds: string[]) {
    const { data } = await this.client.post('/reports/hygiene/resolve/', { alert_ids: alertIds });
    return data;
  }
}

export const api = new ApiService();
export default api;
