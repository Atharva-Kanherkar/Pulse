// src/lib/types.ts
export interface JobStatus {
    job_id: string;
    status: 'started' | 'running' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
    progress?: {
      current_agent?: string;
      completed_agents: string[];
      total_agents: number;
    };
    results?: {
      calendar?: string;
      people_research?: string;
      technical_context?: string;
      slack_context?: string;
      coordinator?: string;
      final_briefing?: string;
      agenda?: any;
    };
    error?: string;
  }
  
  export interface MeetingPrepRequest {
    meeting_context?: string;
    include_slack: boolean;
    include_agenda: boolean;
    focus_mode?: 'balanced' | 'blockers' | 'design' | 'progress' | 'planning';
    user_preferences?: Record<string, any>;
  }
  
  export interface CustomMeetingPrepRequest {
    agents: string[];
    meeting_context?: string;
    calendar_data?: Record<string, any>;
    people_data?: Record<string, any>;
    technical_data?: Record<string, any>;
    slack_data?: Record<string, any>;
  }
  
  export interface AgentInfo {
    id: string;
    name: string;
    description: string;
    status: 'idle' | 'running' | 'completed' | 'error';
  }
  
  export const AVAILABLE_AGENTS = [
    { id: 'calendar', name: 'Calendar Agent', description: 'Extracts meeting and calendar data' },
    { id: 'people_research', name: 'People Research', description: 'Profiles meeting attendees' },
    { id: 'technical_context', name: 'Technical Context', description: 'Analyzes technical information' },
    { id: 'slack_context', name: 'Slack Analysis', description: 'Analyzes team communications' },
    { id: 'coordinator', name: 'Coordinator', description: 'Synthesizes final briefing' },
  ];
  
  export const FOCUS_MODES = [
    { id: 'balanced', name: 'Balanced', description: 'Equal coverage of all topics' },
    { id: 'blockers', name: 'Blockers', description: 'Focus on current blockers and urgent decisions' },
    { id: 'design', name: 'Design', description: 'Emphasize design updates and creative discussions' },
    { id: 'progress', name: 'Progress', description: 'Highlight progress updates and milestone reviews' },
    { id: 'planning', name: 'Planning', description: 'Concentrate on future planning and strategy' },
  ];