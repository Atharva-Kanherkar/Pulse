// lib/types.ts
export interface JobStatus {
    job_id: string;
    status: 'started' | 'running' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
    progress?: {
      current_agent?: string;
      completed_agents: string[];
      total_agents?: number;
    };
    results?: Record<string, any>;
    error?: string;
    type?: string;
  }
  
  export interface AgentConfig {
    name: string;
    enabled: boolean;
    icon: string;
    description: string;
  }