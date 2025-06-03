"use client";

import { ExternalLink } from 'lucide-react';
import { JobFile } from '@/app/dashboard/jobs/[id]/page'; // Adjust path if JobFile moves
import { JobFileItem } from './job-file-item'; // Import the new JobFileItem component

interface JobFilesSectionProps {
  files: JobFile[];
  isLoading: boolean;
  error: string | null;
}

export function JobFilesSection({ files, isLoading, error }: JobFilesSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Related Files</h2>
      <div className="shadow rounded-lg p-6 bg-card text-card-foreground">
        {isLoading && <p>Loading files...</p>}
        {error && <p className="text-red-500">Error loading files: {error}</p>}
        {!isLoading && !error && files.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No files associated with this job.</p>
        )}
        {!isLoading && !error && files.length > 0 && (
          <ul className="space-y-3">
            {files.map((file) => (
              <JobFileItem key={file.id} file={file} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 