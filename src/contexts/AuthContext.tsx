import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  github_connected: boolean;
  jira_connected: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  githubConnected: boolean;
  jiraConnected: boolean;
  setGithubConnected: (connected: boolean) => void;
  setJiraConnected: (connected: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default user - no login required
const defaultUser: User = {
  id: 'local-user',
  email: 'developer@local',
  username: 'Developer',
  github_connected: false,
  jira_connected: false,
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [jiraConnected, setJiraConnected] = useState(false);

  useEffect(() => {
    // Check localStorage for connection status
    const ghConnected = localStorage.getItem('github_connected') === 'true';
    const jiraConn = localStorage.getItem('jira_connected') === 'true';
    setGithubConnected(ghConnected);
    setJiraConnected(jiraConn);
    setIsLoading(false);
  }, []);

  const handleSetGithubConnected = (connected: boolean) => {
    setGithubConnected(connected);
    localStorage.setItem('github_connected', String(connected));
  };

  const handleSetJiraConnected = (connected: boolean) => {
    setJiraConnected(connected);
    localStorage.setItem('jira_connected', String(connected));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: true, // Always authenticated
        githubConnected,
        jiraConnected,
        setGithubConnected: handleSetGithubConnected,
        setJiraConnected: handleSetJiraConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
