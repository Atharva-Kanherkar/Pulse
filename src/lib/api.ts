// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health Check
  async healthCheck() {
    return this.request<{
      status: string;
      portia_available: boolean;
      environment: string;
      timestamp: string;
      version: string;
    }>('/api/v1/health');
  }

  // Meeting Preparation
  async prepareMeeting(data: {
    meeting_context?: string;
    include_slack: boolean;
    include_agenda: boolean;
    focus_mode?: string;
    user_preferences?: Record<string, any>;
  }) {
    return this.request<{
      job_id: string;
      status: string;
      message: string;
    }>('/api/v1/meetings/prepare', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Custom Meeting Preparation
  async prepareCustomMeeting(data: {
    agents: string[];
    meeting_context?: string;
    calendar_data?: Record<string, any>;
    people_data?: Record<string, any>;
    technical_data?: Record<string, any>;
    slack_data?: Record<string, any>;
  }) {
    return this.request<{
      job_id: string;
      status: string;
      message: string;
    }>('/api/v1/meetings/prepare-custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Agenda Preparation
  async prepareAgenda(data: {
    meeting_context: Record<string, any>;
    focus_mode?: string;
    participant_roles?: Record<string, string>;
  }) {
    return this.request<{
      job_id: string;
      status: string;
      message: string;
    }>('/api/v1/meetings/prepare-agenda', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Job Status
  async getJobStatus(jobId: string) {
    return this.request<{
      job_id: string;
      status: string;
      created_at: string;
      updated_at: string;
      progress?: {
        current_agent?: string;
        completed_agents: string[];
        total_agents: number;
      };
      results?: Record<string, any>;
      error?: string;
    }>(`/api/v1/meetings/jobs/${jobId}`);
  }

  // Get All Jobs
  async getAllJobs() {
    return this.request<Record<string, {
      job_id: string;
      status: string;
      created_at: string;
      updated_at: string;
      progress: Record<string, any>;
      type: string;
    }>>('/api/v1/meetings/jobs');
  }

  // Delete Job
  async deleteJob(jobId: string) {
    return this.request<{ message: string }>(`/api/v1/meetings/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();