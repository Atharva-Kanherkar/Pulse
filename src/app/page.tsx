// import React from "react";
// import Navbar from "@/components/landing/navbar";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Shield, Users, Database, Palette } from "lucide-react";
// import Link from "next/link";
// import {Hero }from "@/components/landing/hero";

// const HomePage = () => {
//    return (
//         <div>
//          <Navbar/>
//            <Hero />
//         </div>
//    )
// };

// export default HomePage;
 // app/page.tsx
 // src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import MeetingDashboard from '@/components/dashboard/MeetingDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    portia_available: boolean;
    environment: string;
  } | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiClient.healthCheck();
        setHealthStatus(health);
        setHealthError(null);
      } catch (error) {
        setHealthError(error instanceof Error ? error.message : 'Health check failed');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Health Status Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {healthError ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Backend Unavailable</span>
                  </>
                ) : healthStatus?.status === 'healthy' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Backend Connected</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">Connecting...</span>
                  </>
                )}
              </div>
              {healthStatus && (
                <div className="flex items-center gap-2">
                  <Badge variant={healthStatus.portia_available ? "default" : "secondary"}>
                    Portia: {healthStatus.portia_available ? 'Available' : 'Mock Mode'}
                  </Badge>
                  <Badge variant="outline">
                    {healthStatus.environment}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {healthError ? (
        <div className="max-w-7xl mx-auto p-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Backend Connection Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-4">{healthError}</p>
              <p className="text-sm text-gray-600">
                Make sure the Smart Meeting Agent backend is running on{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                </code>
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <MeetingDashboard />
      )}
    </div>
  );
}