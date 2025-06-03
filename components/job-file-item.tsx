"use client";

import {  FileText, ImageIcon, Paperclip } from 'lucide-react';
import { JobFile } from '@/app/dashboard/jobs/[id]/page'; // Adjust path if JobFile moves or is centralized
import { StatusBadge } from './status-badge';

// Helper function to check if the object is a File API object
function isBrowserFile(file: File | JobFile): file is File {
  return file instanceof File;
}

interface JobFileItemProps {
  file: JobFile | File; // Can be either a JobFile from DB or a File from browser API
}

// Helper function to format file size
function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const getFileIcon = (mimeType: string | null | undefined) => {
  if (!mimeType) return <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
  }
  return <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
};

export function JobFileItem({ file }: JobFileItemProps) {
  const isJobFile = !isBrowserFile(file);
  const jobFile = isJobFile ? file as JobFile : null;
  const browserFile = isBrowserFile(file) ? file as File : null;

  const name = browserFile?.name || jobFile?.name || 'Untitled File';
  const size = browserFile?.size ?? jobFile?.size_bytes;
  const mimeType = browserFile?.type || jobFile?.mime_type;
  const date = jobFile?.created_at || browserFile?.lastModified;
  const dateType = jobFile ? 'Added' : 'Last Modified';

  return (
    <li className="flex items-center justify-between p-3 hover:bg-muted/80 bg-muted/50 rounded-md transition-colors">
      <div className="flex items-center gap-3 min-w-0"> {/* Added min-w-0 for better truncation if needed */}
        {getFileIcon(mimeType)}
        <div className="flex-1 min-w-0"> {/* Added flex-1 and min-w-0 for truncation */}
          <span className="font-medium text-gray-800 dark:text-gray-200 break-all block truncate" title={name}>
            {name}
          </span>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2">
            <span>{formatFileSize(size)}</span>
            {mimeType && <span>&bull; {mimeType}</span>}
            {date && (
              <span>
                &bull; {dateType}: {new Date(date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {isJobFile && jobFile?.status && (
         <div className="ml-2 flex-shrink-0">
            <StatusBadge status={jobFile.status} />
         </div>
      )}
    </li>
  );
} 