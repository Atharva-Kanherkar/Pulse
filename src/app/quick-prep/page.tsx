'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { meetingApi } from '../../lib/api';
import { Calendar, Users, MessageSquare, FileText, Loader2 } from 'lucide-react';

export default function QuickPrep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meeting_context: '',
    include_slack: true,
    include_agenda: false,
    focus_mode: 'balanced'
  });

  const focusModes = [
    { value: 'balanced', label: 'Balanced', description: 'Equal focus on all aspects' },
    { value: 'blockers', label: 'Blockers', description: 'Focus on current blockers and urgent issues' },
    { value: 'design', label: 'Design', description: 'Emphasize design updates and reviews' },
    { value: 'progress', label: 'Progress', description: 'Highlight progress updates and milestones' },
    { value: 'planning', label: 'Planning', description: 'Concentrate on future planning and strategy' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.meeting_context.trim()) {
      alert('Please provide meeting context');
      return;
    }

    setLoading(true);
    
    try {
      const response = await meetingApi.prepareMeeting(formData) as { job_id: string };
      router.push(`/jobs/${response.job_id}`);
    } catch (error) {
      console.error('Failed to start meeting preparation:', error);
      alert('Failed to start meeting preparation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quick Meeting Preparation</h1>
          <p className="mt-2 text-gray-600">
            Let our AI agents prepare a comprehensive briefing for your upcoming meeting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Meeting Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="meeting_context" className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Context *
                  </label>
                  <textarea
                    id="meeting_context"
                    rows={4}
                    className="input w-full"
                    placeholder="e.g., GSoC Workflows4s weekly standup, Technical architecture review, Project planning session..."
                    value={formData.meeting_context}
                    onChange={(e) => setFormData({ ...formData, meeting_context: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide context about your meeting to help our agents research relevant information
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Focus Mode
                  </label>
                  <div className="space-y-3">
                    {focusModes.map((mode) => (
                      <label key={mode.value} className="flex items-start">
                        <input
                          type="radio"
                          name="focus_mode"
                          value={mode.value}
                          checked={formData.focus_mode === mode.value}
                          onChange={(e) => setFormData({ ...formData, focus_mode: e.target.value })}
                          className="mt-1 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-700">{mode.label}</div>
                          <div className="text-xs text-gray-500">{mode.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Additional Options</h3>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.include_slack}
                      onChange={(e) => setFormData({ ...formData, include_slack: e.target.checked })}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Include Slack communication analysis</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.include_agenda}
                      onChange={(e) => setFormData({ ...formData, include_agenda: e.target.checked })}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Generate AI-powered agenda</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Preparation...
                    </>
                  ) : (
                    'Start Meeting Preparation'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What We'll Research</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Calendar Analysis</div>
                    <div className="text-xs text-gray-600">Extract meeting details and attendee information</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Attendee Research</div>
                    <div className="text-xs text-gray-600">Profile participants and their backgrounds</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Technical Context</div>
                    <div className="text-xs text-gray-600">Gather relevant technical information and documentation</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Communication History</div>
                    <div className="text-xs text-gray-600">Analyze recent team discussions and updates</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated Time</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">3-5</div>
                <div className="text-sm text-gray-600">minutes</div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Comprehensive research that would take you 30+ minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}