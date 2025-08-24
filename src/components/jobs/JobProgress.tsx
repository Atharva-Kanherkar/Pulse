// src/components/jobs/JobProgress.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Calendar,
  Users,
  Code,
  MessageSquare,
  Bot,
  FileText
} from 'lucide-react';
import { JobStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface JobProgressProps {
  job: JobStatus;
}

const AGENT_ICONS = {
  calendar: Calendar,
  people_research: Users,
  technical_context: Code,
  slack_context: MessageSquare,
  coordinator: Bot,
  agenda_builder: FileText,
} as const;

export function JobProgress({ job }: JobProgressProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // const getStatusColor = () => {
  //   switch (job.status) {
  //     case 'running':
  //       return 'bg-blue-500';
  //     case 'completed':
  //       return 'bg-green-500';
  //     case 'failed':
  //       return 'bg-red-500';
  //     default:
  //       return 'bg-gray-500';
  //   }
  // };

  const progressPercentage = job.progress 
    ? (job.progress.completed_agents.length / job.progress.total_agents) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Job Progress
          </div>
          <Badge variant="outline" className="capitalize">
            {job.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Current Agent */}
        {job.status === 'running' && job.progress?.current_agent && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Current Agent</div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              {(() => {
                const IconComponent = AGENT_ICONS[job.progress.current_agent as keyof typeof AGENT_ICONS];
                return IconComponent ? <IconComponent className="h-4 w-4 text-blue-600" /> : <Bot className="h-4 w-4 text-blue-600" />;
              })()}
              <span className="text-sm capitalize">
                {job.progress.current_agent.replace('_', ' ')}
              </span>
              <Loader2 className="h-3 w-3 animate-spin text-blue-600 ml-auto" />
            </div>
          </div>
        )}

        {/* Completed Agents */}
        {job.progress && job.progress.completed_agents.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Completed Agents</div>
            <div className="space-y-1">
              {job.progress.completed_agents.map((agent) => {
                const IconComponent = AGENT_ICONS[agent as keyof typeof AGENT_ICONS];
                return (
                  <div key={agent} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    {IconComponent ? <IconComponent className="h-4 w-4 text-green-600" /> : <Bot className="h-4 w-4 text-green-600" />}
                    <span className="text-sm capitalize">
                      {agent.replace('_', ' ')}
                    </span>
                    <CheckCircle2 className="h-3 w-3 text-green-600 ml-auto" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Job Info */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Job ID</span>
            <code className="bg-gray-100 px-2 py-1 rounded">{job.job_id}</code>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Started</span>
            <span>{formatDistanceToNow(new Date(job.created_at))} ago</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last Updated</span>
            <span>{formatDistanceToNow(new Date(job.updated_at))} ago</span>
          </div>
        </div>

        {/* Error Message */}
        {job.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-1">
              <AlertCircle className="h-4 w-4" />
              Error
            </div>
            <p className="text-sm text-red-600">{job.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}