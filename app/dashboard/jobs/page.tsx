"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client'; 
import { JobsTable } from '@/components/jobs-table'; 

export interface Job {
  id: number; // Changed from bigint for simplicity in frontend, adjust if needed
  created_at: string;
  name: string | null;
  status: string | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
      } else if (data) {
        setJobs(data as Job[]);
      }
    };

    fetchJobs();

    const channel = supabase
      .channel('realtime-jobs-table-changes') // Unique channel name
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          console.log('Job change received!', payload);
          if (payload.eventType === 'INSERT') {
            setJobs((prevJobs) => [...prevJobs, payload.new as Job]);
          }
          if (payload.eventType === 'UPDATE') {
            setJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.id === payload.new.id ? (payload.new as Job) : job
              )
            );
          }
          if (payload.eventType === 'DELETE') {
            // Ensure payload.old has the correct structure, especially the id
            setJobs((prevJobs) =>
              prevJobs.filter((job) => job.id !== (payload.old as { id: number }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* We can add a header or title here if needed */}
      {/* e.g., <h1 className="text-2xl font-semibold">Jobs</h1> */}
      <JobsTable data={jobs} />
    </div>
  );
}