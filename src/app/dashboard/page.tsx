// import Navbar from "@/components/landing/navbar";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Shield, Users, Mail, Settings, Code } from "lucide-react";
// import Link from "next/link";

// const DashboardPage = () => {
//   const techStack = [
//     "Next.js 15",
//     "Better Auth",
//     "PostgreSQL",
//     "Drizzle ORM",
//     "Tailwind CSS",
//     "Radix UI",
//     "TypeScript",
//     "React Hook Form",
//     "Zod",
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         {/* Quick Actions */}
//         <Card className="mb-12">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Settings className="h-5 w-5" />
//               Quick Actions
//             </CardTitle>
//             <CardDescription>
//               Get started with common tasks and explore the template features
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <Button
//                 variant="outline"
//                 className="h-auto p-4 flex-col gap-2"
//                 asChild
//               >
//                 <Link href="/auth/register">
//                   <Users className="h-5 w-5" />
//                   <span>Create Account</span>
//                 </Link>
//               </Button>
//               <Button
//                 variant="outline"
//                 className="h-auto p-4 flex-col gap-2"
//                 asChild
//               >
//                 <Link href="/admin">
//                   <Shield className="h-5 w-5" />
//                   <span>Admin Panel</span>
//                 </Link>
//               </Button>
//               <Button
//                 variant="outline"
//                 className="h-auto p-4 flex-col gap-2"
//                 asChild
//               >
//                 <Link
//                   href="https://github.com/zexahq/better-auth-starter"
//                   target="_blank"
//                 >
//                   <Code className="h-5 w-5" />
//                   <span>View Source</span>
//                 </Link>
//               </Button>
//               <Button
//                 variant="outline"
//                 className="h-auto p-4 flex-col gap-2"
//                 asChild
//               >
//                 <Link href="https://docs.zexa.dev" target="_blank">
//                   <Mail className="h-5 w-5" />
//                   <span>Documentation</span>
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Tech Stack */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Tech Stack</CardTitle>
//             <CardDescription>
//               Built with modern technologies for performance, security, and
//               developer experience
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-wrap gap-2">
//               {techStack.map((tech, index) => (
//                 <Badge key={index} variant="outline" className="px-3 py-1">
//                   {tech}
//                 </Badge>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Footer */}
//         <div className="text-center mt-12 pt-8 border-t border-border/50">
//           <p className="text-muted-foreground">
//             Built with ❤️ by{" "}
//             <Link
//               href="https://zexa.dev"
//               target="_blank"
//               className="text-primary hover:underline font-medium"
//             >
//               Zexa
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import JobCard from '../../components/JobCard';
import { meetingApi } from '../../lib/api';
import { Plus, Activity, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, running: 0, completed: 0, failed: 0 });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await meetingApi.getAllJobs();
      const jobList = Object.values(data as Record<string, any>);
      setJobs(jobList);
      
      setStats({
        total: jobList.length,
        running: jobList.filter(j => j.status === 'running').length,
        completed: jobList.filter(j => j.status === 'completed').length,
        failed: jobList.filter(j => j.status === 'failed').length,
      });
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your meeting preparation jobs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-gray-900">{stats.running}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/meetings/new" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Prepare Meeting</h3>
                  <p className="text-sm text-gray-600">Full AI preparation</p>
                </div>
              </div>
            </Link>
            
            <Link href="/agenda/builder" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Build Agenda</h3>
                  <p className="text-sm text-gray-600">Smart agenda creation</p>
                </div>
              </div>
            </Link>
            
            <Link href="/agents" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Run Agent</h3>
                  <p className="text-sm text-gray-600">Individual agent execution</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Jobs</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 6).map(job => (
                <JobCard key={job.job_id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first meeting preparation</p>
              <Link 
                href="/meetings/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Prepare Meeting
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}