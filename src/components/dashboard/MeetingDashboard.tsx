// src/components/dashboard/MeetingDashboard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Calendar, 
  Users, 
  Code, 
  MessageSquare, 
  FileText,
  Play,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { AVAILABLE_AGENTS, FOCUS_MODES } from '@/lib/types';
import { JobProgress } from '@/components/jobs/JobProgress';
import { JobResults } from '@/components/jobs/JobResults';
import { usePolling } from '@/hooks/usePolling';

export default function MeetingDashboard() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [meetingContext, setMeetingContext] = useState('');
  const [includeSlack, setIncludeSlack] = useState(true);
  const [includeAgenda, setIncludeAgenda] = useState(false);
  const [focusMode, setFocusMode] = useState('balanced');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: jobData, loading: jobLoading, error: jobError } = usePolling(activeJobId);

  const handleFullPreparation = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.prepareMeeting({
        meeting_context: meetingContext || undefined,
        include_slack: includeSlack,
        include_agenda: includeAgenda,
        focus_mode: focusMode,
      });
      setActiveJobId(response.job_id);
    } catch (error) {
      console.error('Failed to start preparation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomPreparation = async () => {
    if (selectedAgents.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.prepareCustomMeeting({
        agents: selectedAgents,
        meeting_context: meetingContext || undefined,
      });
      setActiveJobId(response.job_id);
    } catch (error) {
      console.error('Failed to start custom preparation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgendaPreparation = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.prepareAgenda({
        meeting_context: { context: meetingContext },
        focus_mode: focusMode,
      });
      setActiveJobId(response.job_id);
    } catch (error) {
      console.error('Failed to start agenda preparation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Meeting Agent
          </h1>
          <p className="text-gray-600">
            AI-powered meeting preparation with multi-agent orchestration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Meeting Preparation
                </CardTitle>
                <CardDescription>
                  Configure your meeting preparation workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meeting Context */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meeting Context (Optional)</label>
                  <Textarea
                    placeholder="Describe your meeting (e.g., Weekly team standup, Q1 Planning Review, Product Launch Discussion...)"
                    value={meetingContext}
                    onChange={(e) => setMeetingContext(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Tabs defaultValue="full" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="full">Full Preparation</TabsTrigger>
                    <TabsTrigger value="custom">Custom Agents</TabsTrigger>
                    <TabsTrigger value="agenda">Agenda Only</TabsTrigger>
                  </TabsList>

                  <TabsContent value="full" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-slack"
                          checked={includeSlack}
                          onCheckedChange={(checked) => setIncludeSlack(checked as boolean)}
                        />
                        <label htmlFor="include-slack" className="text-sm font-medium">
                          Include Slack Analysis
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-agenda"
                          checked={includeAgenda}
                          onCheckedChange={(checked) => setIncludeAgenda(checked as boolean)}
                        />
                        <label htmlFor="include-agenda" className="text-sm font-medium">
                          Generate Agenda
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Focus Mode</label>
                      <Select value={focusMode} onValueChange={setFocusMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FOCUS_MODES.map((mode) => (
                            <SelectItem key={mode.id} value={mode.id}>
                              <div>
                                <div className="font-medium">{mode.name}</div>
                                <div className="text-xs text-gray-500">{mode.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleFullPreparation}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start Full Preparation
                    </Button>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Agents</label>
                      <div className="grid grid-cols-1 gap-2">
                        {AVAILABLE_AGENTS.map((agent) => (
                          <div
                            key={agent.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedAgents.includes(agent.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleAgent(agent.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{agent.name}</div>
                                <div className="text-xs text-gray-500">{agent.description}</div>
                              </div>
                              <Checkbox
                                checked={selectedAgents.includes(agent.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleCustomPreparation}
                      disabled={isSubmitting || selectedAgents.length === 0}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start Custom Preparation
                    </Button>
                  </TabsContent>

                  <TabsContent value="agenda" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Focus Mode</label>
                      <Select value={focusMode} onValueChange={setFocusMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FOCUS_MODES.map((mode) => (
                            <SelectItem key={mode.id} value={mode.id}>
                              <div>
                                <div className="font-medium">{mode.name}</div>
                                <div className="text-xs text-gray-500">{mode.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleAgendaPreparation}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Generate Agenda
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {jobData && (
              <>
                <JobProgress job={jobData} />
                {jobData.status === 'completed' && jobData.results && (
                  <JobResults results={jobData.results} />
                )}
              </>
            )}
            
            {jobError && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">{jobError}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}