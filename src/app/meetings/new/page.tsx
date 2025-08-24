// app/meetings/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { meetingApi } from '../../../lib/api';
import { Calendar, Users, MessageSquare, FileText, Settings } from 'lucide-react';

export default function NewMeeting() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meeting_context: '',
    include_slack: true,
    include_agenda: false,
    focus_mode: 'balanced',
    preparation_type: 'full'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = formData.preparation_type === 'agenda' 
        ? await meetingApi.prepareAgenda(formData.meeting_context, formData.focus_mode)
        : await meetingApi.prepareMeeting(formData);
      
      const responseData = response as { job_id: string };
      router.push(`/meetings/${responseData.job_id}`);
    } catch (error) {
      console.error('Failed to start preparation:', error);
      alert('Failed to start preparation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prepare New Meeting</h1>
          <p className="text-gray-600">Let AI help you prepare for your upcoming meeting</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preparation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preparation Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer ${
                    formData.preparation_type === 'full' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({...formData, preparation_type: 'full'})}
                >
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Full Preparation</span>
                  </div>
                  <p className="text-sm text-gray-600">Complete AI analysis with all agents</p>
                </div>
                
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer ${
                    formData.preparation_type === 'agenda' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({...formData, preparation_type: 'agenda'})}
                >
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium">Agenda Only</span>
                  </div>
                  <p className="text-sm text-gray-600">Focus on intelligent agenda building</p>
                </div>
              </div>
            </div>

            {/* Meeting Context */}
            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Context
              </label>
              <textarea
                id="context"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Weekly team standup, GSoC Workflows4s project review, Client technical discussion..."
                value={formData.meeting_context}
                onChange={(e) => setFormData({...formData, meeting_context: e.target.value})}
                required
              />
            </div>

            {/* Focus Mode (for agenda) */}
            {formData.preparation_type === 'agenda' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Mode
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.focus_mode}
                  onChange={(e) => setFormData({...formData, focus_mode: e.target.value})}
                >
                  <option value="balanced">Balanced</option>
                  <option value="blockers">Focus on Blockers</option>
                  <option value="design">Focus on Design</option>
                  <option value="progress">Focus on Progress</option>
                  <option value="planning">Focus on Planning</option>
                </select>
              </div>
            )}

            {/* Options (for full prep) */}
            {formData.preparation_type === 'full' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.include_slack}
                      onChange={(e) => setFormData({...formData, include_slack: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <MessageSquare className="h-4 w-4 mx-2 text-gray-600" />
                    <span className="text-sm text-gray-700">Include Slack communication analysis</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.include_agenda}
                      onChange={(e) => setFormData({...formData, include_agenda: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <FileText className="h-4 w-4 mx-2 text-gray-600" />
                    <span className="text-sm text-gray-700">Generate smart agenda</span>
                  </label>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Preparation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}