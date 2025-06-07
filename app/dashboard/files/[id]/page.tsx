"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/status-badge'; // Assuming you have this from previous steps
import { ExternalLink, Paperclip, Briefcase, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Added Button for Back button
import { Invoice, InvoiceItem } from '@/components/invoice-item'; // Import Invoice and InvoiceItem

// Interface based on your 'files' table schema and JobFile for consistency
export interface FileDetail {
  id: number;
  created_at: string;
  name: string | null;
  size_bytes: number | null;
  mime_type: string | null;
  user_id: string | null; // Added user_id from schema
  job_id: number | null;
  path: string | null;
  full_path: string | null;
  status: string | null;
}

// Helper function to format file size (can be moved to a utils file later)
function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function FileDetailPage() {
  const [file, setFile] = useState<FileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const fileId = params?.id as string;

  useEffect(() => {
    const fetchFileDetails = async () => {
      if (!fileId) {
        setError("Invalid file ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', parseInt(fileId, 10))
        .single();

      if (fetchError) {
        console.error('Error fetching file details:', fetchError);
        setError(fetchError.message);
        setFile(null);
      } else if (data) {
        setFile(data as FileDetail);
        setError(null);
      } else {
        setError("File not found.");
        setFile(null);
      }
      setLoading(false);
    };

    if (fileId) {
      fetchFileDetails();
    }
  }, [supabase, fileId]);

  // New useEffect to fetch related invoices
  useEffect(() => {
    if (!fileId) {
      setInvoicesLoading(false);
      // No need to set error if fileId isn't there yet, main fetch will handle it
      return;
    }

    const fetchRelatedInvoices = async () => {
      setInvoicesLoading(true);
      setInvoicesError(null);

      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('file_id', parseInt(fileId, 10))
        .order('updated_at', { ascending: false });
        console.log('data :', data);

      if (fetchError) {
        console.error('Error fetching related invoices:', fetchError);
        setInvoicesError(fetchError.message);
        setInvoices([]);
      } else if (data) {
        setInvoices(data as Invoice[]);
      }
      setInvoicesLoading(false);
    };

    fetchRelatedInvoices();
  }, [supabase, fileId]);

  if (loading) {
    return <div className="p-4 md:p-6">Loading file details...</div>;
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">Error: {error}</div>;
  }

  if (!file) {
    return <div className="p-4 md:p-6">File not found.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {file.full_path && (
          <a
            href={file.full_path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
          >
            View Raw File <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        )}
      </div>

      <div className="flex items-center">
        <Paperclip className="w-7 h-7 mr-3 text-primary" />
        <h1 className="text-2xl lg:text-3xl font-semibold break-all">
          {file.name || 'Untitled File'}
        </h1>
      </div>

      <div className="shadow rounded-lg bg-card text-card-foreground">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong className="block text-sm font-medium text-muted-foreground">File Name:</strong>
              <p className="text-sm break-all">{file.name || 'N/A'}</p>
            </div>
            <div>
              <strong className="block text-sm font-medium text-muted-foreground">Status:</strong>
              <StatusBadge status={file.status} />
            </div>
            <div>
              <strong className="block text-sm font-medium text-muted-foreground">Size:</strong>
              <p className="text-sm">{formatFileSize(file.size_bytes)}</p>
            </div>
            <div>
              <strong className="block text-sm font-medium text-muted-foreground">MIME Type:</strong>
              <p className="text-sm">{file.mime_type || 'N/A'}</p>
            </div>
            <div>
              <strong className="block text-sm font-medium text-muted-foreground">Uploaded At:</strong>
              <p className="text-sm">{new Date(file.created_at).toLocaleString()}</p>
            </div>
            {file.job_id && (
              <div>
                <strong className="block text-sm font-medium text-muted-foreground">Associated Job ID:</strong>
                <Link href={`/dashboard/jobs/${file.job_id}`} className="text-sm text-primary hover:underline flex items-center">
                  {file.job_id} <Briefcase className="ml-1 h-4 w-4" />
                </Link>
              </div>
            )}
            <div>
              <strong className="block text-sm font-medium text-muted-foreground">File ID:</strong>
              <p className="text-sm">{file.id}</p>
            </div>
            {file.user_id && (
               <div>
                <strong className="block text-sm font-medium text-muted-foreground">Uploader User ID:</strong>
                <p className="text-sm">{file.user_id}</p>
              </div>
            )}
             {file.path && (
               <div>
                <strong className="block text-sm font-medium text-muted-foreground">Storage Path:</strong>
                <p className="text-sm break-all">{file.path}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Invoices Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Related Invoices</h2>
        {invoicesLoading && <p className="text-muted-foreground">Loading invoices...</p>}
        {invoicesError && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>Error loading invoices: {invoicesError}</p>
            </div>
        )}
        {!invoicesLoading && !invoicesError && invoices.length === 0 && (
          <p className="text-muted-foreground">No invoices directly associated with this file.</p>
        )}
        {!invoicesLoading && !invoicesError && invoices.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {invoices.map((invoice) => (
              <InvoiceItem key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 