"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { StatusBadge } from "@/components/status-badge"; // Import the new component
import {  ArrowLeft, Briefcase } from 'lucide-react'; // Added ArrowLeft, removed Paperclip if not used directly here
import { JobFilesSection } from "@/components/job-files-section"; // Import the new section component
import { Button } from '@/components/ui/button'; // Added Button for Back button

// Assuming the Job interface is the same as in the jobs list page
export interface Job {
  id: number;
  created_at: string;
  name: string | null;
  status: string | null;
  description: string | null; // Assuming description can be part of the job
  // file_url: string | null; // This might be a primary file, or files are handled in job_files
}

export interface JobFile {
  id: number; // Matches files.id (bigint)
  job_id: number; // Matches files.job_id (bigint)
  name: string | null; // Matches files.name (text), was file_name
  full_path: string | null; // Matches files.full_path (text), was file_url, assuming this is the linkable URL
  created_at: string; // Matches files.created_at (timestamp with time zone), was uploaded_at
  size_bytes: number | null; // Matches files.size_bytes (bigint)
  mime_type: string | null; // Matches files.mime_type (text)
  status: string | null; // Matches files.status (text)
  path: string | null; // Matches files.path (text), optional to add if needed
}

export default function JobDetailPage() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [jobFiles, setJobFiles] = useState<JobFile[]>([]);
  console.log('jobFiles :', jobFiles);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);

  const supabase = createClient();
  const params = useParams();
  const router = useRouter(); // Initialize router
  const jobId = params?.id as string; // id will be a string

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError("Invalid job ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*') // You might want to select specific fields: 'id,created_at,name,status,description'
        .eq('id', parseInt(jobId, 10))
        .single();

      if (fetchError) {
        console.error('Error fetching job details:', fetchError);
        setError(fetchError.message);
        setJob(null);
      } else if (data) {
        setJob(data as Job);
        setError(null);
      } else {
        setError("Job not found.");
        setJob(null);
      }
      setLoading(false);
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [supabase, jobId]);

  useEffect(() => {
    const fetchJobFiles = async () => {
      if (!jobId) {
        // setError("Invalid job ID for files."); // Or handle silently
        setFilesLoading(false);
        return;
      }

      setFilesLoading(true);
      const { data, error: fetchError } = await supabase
        .from('files') // Assuming your table is named 'job_files'
        .select('*') // Select all columns or specific ones: id, file_name, file_url, uploaded_at
        .eq('job_id', parseInt(jobId, 10))
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching job files:', fetchError);
        setFilesError(fetchError.message);
        setJobFiles([]);
      } else if (data) {
        setJobFiles(data as JobFile[]);
        setFilesError(null);
      } else {
        setFilesError("No files found for this job.");
        setJobFiles([]);
      }
      setFilesLoading(false);
    };

    if (jobId) {
      fetchJobFiles();
    }
    // Add real-time subscription for job_files if needed, similar to the jobs page
  }, [supabase, jobId]);

  if (loading) {
    return <div className="p-4 md:p-6">Loading job details...</div>;
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">Error: {error}</div>;
  }

  if (!job) {
    return <div className="p-4 md:p-6">Job not found.</div>;
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      {/* Job Details Section */}
      <div>
        <div className="flex items-center mb-2">
            <Briefcase className="w-7 h-7 mr-3 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-semibold">
                Job: {job.name || 'Untitled Job'}
            </h1>
        </div>
        <div className="shadow rounded-lg p-6 bg-card text-card-foreground">
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex items-baseline">
              <strong className="mr-2 text-sm text-muted-foreground">ID:</strong>
              <span className="text-sm text-card-foreground">{job.id}</span>
            </div>
            <div className="flex items-baseline">
              <strong className="mr-2 text-sm text-muted-foreground">Status:</strong>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex items-baseline">
              <strong className="mr-2 text-sm text-muted-foreground">Created:</strong>
              <span className="text-sm text-card-foreground">{new Date(job.created_at).toLocaleString()}</span>
            </div>
            {job.description && (
              <div className="w-full pt-2">
                <strong className="block text-sm text-muted-foreground mb-1">Description:</strong>
                <p className="text-sm text-card-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{job.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Files Section - Now uses the reusable component */}
      <JobFilesSection files={jobFiles} isLoading={filesLoading} error={filesError} />
    </div>
  );
} 