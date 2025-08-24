// src/hooks/usePolling.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { JobStatus } from '@/lib/types';

export function usePolling(jobId: string | null, interval: number = 2000) {
  const [data, setData] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setError(null);
      const response = await apiClient.getJobStatus(jobId);
      // Map status to JobStatus type
      const allowedStatuses = ['started', 'running', 'completed', 'failed'] as const;
      const mappedStatus = allowedStatuses.includes(response.status as any)
        ? (response.status as JobStatus['status'])
        : 'failed';
      setData({ ...response, status: mappedStatus });

      // Stop polling if job is completed or failed
      if (mappedStatus === 'completed' || mappedStatus === 'failed') {
        return false; // Signal to stop polling
      }
      return true; // Continue polling
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false; // Stop polling on error
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Initial fetch
    fetchJobStatus().then((shouldContinue) => {
      setLoading(false);
      
      if (!shouldContinue) return;

      // Set up polling
      const intervalId = setInterval(async () => {
        const shouldContinue = await fetchJobStatus();
        if (!shouldContinue) {
          clearInterval(intervalId);
        }
      }, interval);

      return () => clearInterval(intervalId);
    });
  }, [jobId, interval, fetchJobStatus]);

  return { data, loading, error, refetch: fetchJobStatus };
}