"use client";

import React, { useEffect, useState } from 'react';
import { FileText, ImageIcon, Paperclip, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { JobFile } from '@/app/dashboard/jobs/[id]/page';
import { Invoice, InvoiceItem } from '@/components/invoice-item';
import { StatusBadge } from './status-badge';
import { createClient } from '@/lib/supabase/client';

// Helper function to check if the object is a File API object
function isBrowserFile(file: File | JobFile): file is File {
  return file instanceof File;
}

interface JobFileItemProps {
  file: JobFile | File;
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

const getFileIcon = (mimeType: string | null | undefined, className?: string) => {
  const classes = className || "w-5 h-5 text-gray-500 dark:text-gray-400";
  if (!mimeType) return <FileText className={classes} />;
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className={classes} />;
  }
  if (mimeType.startsWith('application/pdf')) {
    return <FileText className={classes} />;
  }
  return <Paperclip className={classes} />;
};

export function JobFileItem({ file }: JobFileItemProps) {
  const [relatedInvoices, setRelatedInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const supabase = createClient();

  const isJobFile = !isBrowserFile(file);
  const jobFile = isJobFile ? file as JobFile : null;
  const browserFile = isBrowserFile(file) ? file as File : null;

  const name = browserFile?.name || jobFile?.name || 'Untitled File';
  const size = browserFile?.size ?? jobFile?.size_bytes;
  const mimeType = browserFile?.type || jobFile?.mime_type;
  const date = jobFile?.created_at || browserFile?.lastModified;
  const dateLabel = jobFile ? 'Added' : 'Last Modified';

  useEffect(() => {
    if (isJobFile && jobFile?.id) {
      const fetchRelatedInvoices = async () => {
        setInvoicesLoading(true);
        setInvoicesError(null);
        setRelatedInvoices([]);

        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('file_id', jobFile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching related invoices:', error);
          setInvoicesError(error.message);
        } else if (data) {
          setRelatedInvoices(data as Invoice[]);
        }
        setInvoicesLoading(false);
      };

      // Initial fetch
      fetchRelatedInvoices();

      // Set up real-time subscription
      const subscription = supabase
        .channel(`invoices-${jobFile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'invoices',
            filter: `file_id=eq.${jobFile.id}`
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            
            // Handle different types of changes
            switch (payload.eventType) {
              case 'INSERT':
                setRelatedInvoices(prev => [payload.new as Invoice, ...prev]);
                break;
              case 'UPDATE':
                setRelatedInvoices(prev => 
                  prev.map(invoice => 
                    invoice.id === payload.new.id ? payload.new as Invoice : invoice
                  )
                );
                break;
              case 'DELETE':
                setRelatedInvoices(prev => 
                  prev.filter(invoice => invoice.id !== payload.old.id)
                );
                break;
            }
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isJobFile, jobFile?.id, supabase]);

  const renderInvoicesSection = () => {
    if (!isJobFile || !jobFile?.id) return null;

    return (
      <div className={`mt-2 pl-8 border-l-2 border-muted transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Related Invoices
        </div>
        <div className="space-y-2">
          {invoicesLoading && (
            <p className="text-sm text-muted-foreground">Loading invoices...</p>
          )}
          {invoicesError && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-center text-destructive text-sm">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>Error loading invoices: {invoicesError}</p>
            </div>
          )}
          {!invoicesLoading && !invoicesError && relatedInvoices.length === 0 && (
            <p className="text-sm text-muted-foreground">No invoices associated with this file.</p>
          )}
          {!invoicesLoading && !invoicesError && relatedInvoices.length > 0 && (
            <div className="space-y-2">
              {relatedInvoices.map((invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <li 
        className="flex items-center justify-between p-3 hover:bg-muted/80 bg-muted/50 rounded-md transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {getFileIcon(mimeType)}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-800 dark:text-gray-200 break-all block truncate" title={name}>
              {name}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2">
              <span>{formatFileSize(size)}</span>
              {mimeType && <span>&bull; {mimeType}</span>}
              {date && (
                <span>
                  &bull; {dateLabel}: {new Date(date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isJobFile && jobFile?.status && (
            <StatusBadge status={jobFile.status} />
          )}
          {isJobFile && jobFile?.id && (
            <div className="text-muted-foreground">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </li>
      {renderInvoicesSection()}
    </div>
  );
} 