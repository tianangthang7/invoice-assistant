"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// Define a type for the user information we expect from Supabase
interface AppUser {
  name: string;
  email: string;
  avatar: string;
}

interface Job {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function Page() {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "No email provided",
          avatar: session.user.user_metadata?.avatar_url || "",
        });
      } else {
        setUser(null);
      }
    };

    const getStats = async () => {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*');
      
      if (jobs) {
        setStats({
          totalJobs: jobs.length,
          pendingJobs: jobs.filter(job => job.status === 'pending').length,
          completedJobs: jobs.filter(job => job.status === 'completed').length
        });
      }
    };

    const getRecentJobs = async () => {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (jobs) {
        setRecentJobs(jobs);
      }
    };

    getUser();
    getStats();
    getRecentJobs();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
            email: session.user.email || "No email provided",
            avatar: session.user.user_metadata?.avatar_url || "",
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your jobs</p>
        </div>
        <Link href="/dashboard/new-job">
          <Button className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              All time jobs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingJobs}</div>
            <p className="text-xs text-muted-foreground">
              Jobs in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    {job.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : job.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No jobs yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 