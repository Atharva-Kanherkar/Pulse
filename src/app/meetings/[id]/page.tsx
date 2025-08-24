// app/meetings/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import StatusBadge from '../../../components/StatusBadge';
import ProgressBar from '../../../components/ProgressBar';
import { meetingApi } from '../../../lib/api';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Copy,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Target,
  CheckCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface JobDetailsProps {
  params: {
    id: string;
  };
}

export default function JobDetails({ params }: JobDetailsProps) {
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadJobDetails();
    
    // Auto-refresh for running jobs
    const interval = setInterval(() => {
      if (job?.status === 'running') {
        loadJobDetails(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [params.id, job?.status]);

  const loadJobDetails = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent);
    
    try {
      const jobData = await meetingApi.getJobStatus(params.id);
      setJob(jobData);
    } catch (error) {
      console.error('Failed to load job details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBriefing = () => {
    if (job?.results?.final_briefing) {
      const blob = new Blob([job.results.final_briefing], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-briefing-${params.id}.md`;
      a.click();
    }
  };

  const getProgressPercentage = () => {
    if (!job?.progress) return 0;
    const completed = job.progress.completed_agents?.length || 0;
    const total = job.progress.total_agents || 5;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
                <p className="text-gray-600">{params.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadJobDetails()}
                disabled={refreshing}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {job.results?.final_briefing && (
                <button
                  onClick={downloadBriefing}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <StatusBadge status={job.status} />
              <span className="text-gray-600">
                Created: {new Date(job.created_at).toLocaleString()}
              </span>
            </div>
            
            {job.status === 'running' && (
              <div className="text-sm text-gray-600">
                Current: {job.progress?.current_agent}
              </div>
            )}
          </div>

          {job.progress && (
            <ProgressBar 
              progress={getProgressPercentage()} 
              className="mb-4"
            />
          )}

          {job.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{job.error}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'results', label: 'Results', icon: CheckCircle },
                { id: 'agents', label: 'Agents', icon: Users },
                { id: 'briefing', label: 'Final Briefing', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Job ID</h3>
                    <p className="text-gray-600 font-mono text-sm">{job.job_id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Type</h3>
                    <p className="text-gray-600">{job.type || 'Standard'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                    <p className="text-gray-600">
                      {Math.round((new Date(job.updated_at).getTime() - new Date(job.created_at).getTime()) / 1000)}s
                    </p>
                  </div>
                </div>

                {job.progress && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Progress Details</h3>
                    <div className="space-y-2">
                      {job.progress.completed_agents?.map((agent: string) => (
                        <div key={agent} className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {agent.replace('_', ' ').toUpperCase()}
                        </div>
                      ))}
                      {job.progress.current_agent && (
                        <div className="flex items-center text-blue-600">
                          <div className="h-4 w-4 mr-2 border-2 border-blue-600 rounded-full animate-pulse" />
                          {job.progress.current_agent.replace('_', ' ').toUpperCase()} (Running)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-6">
                {job.results && Object.entries(job.results).map(([key, value]) => {
                  if (key === 'final_briefing') return null;
                  return (
                    <div key={key} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {key.replace('_', ' ').toUpperCase()}
                        </h3>
                        <button
                          onClick={() => copyToClipboard(value as string)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-4">
                {job.progress?.completed_agents?.map((agent: string) => (
                  <div key={agent} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">
                        {agent.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-green-600 text-sm">Completed</span>
                  </div>
                ))}
                
                {job.progress?.current_agent && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="h-5 w-5 border-2 border-blue-600 rounded-full animate-pulse mr-3" />
                      <span className="font-medium text-gray-900">
                        {job.progress.current_agent.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-blue-600 text-sm">Running</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'briefing' && (
              <div>
                {job.results?.final_briefing ? (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{job.results.final_briefing}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {job.status === 'completed' ? 'No briefing generated' : 'Briefing will appear when job completes'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}