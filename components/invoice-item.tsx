"use client";

import Link from 'next/link';
import { StatusBadge } from '@/components/status-badge';
import { FileText, Hash, Tag, Percent, DollarSign, CalendarDays, AlertCircle } from 'lucide-react';

export interface Invoice {
  id: number;
  created_at: string;
  invoice_number: string | null;
  invoice_symbol: string | null;
  tax_code: string | null;
  total_tax: number | null; // Supabase maps numeric to number
  total_bill: number | null;
  status: string | null;
  file_id: number | null;
}

interface InvoiceItemProps {
  invoice: Invoice;
}

// Helper to format currency (can be moved to utils)
const formatCurrency = (amount: number | null | undefined, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export function InvoiceItem({ invoice }: InvoiceItemProps) {
  return (
    <div className="bg-card p-4 shadow rounded-lg border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Hash className="w-5 h-5 mr-2" />
          Invoice: {invoice.invoice_number || 'N/A'}
          {invoice.invoice_symbol && (
            <span className="ml-2 text-sm text-muted-foreground">({invoice.invoice_symbol})</span>
          )}
        </h3>
        {invoice.status && <StatusBadge status={invoice.status} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm mb-3">
        <div>
          <strong className="text-muted-foreground flex items-center"><Tag className="w-4 h-4 mr-1.5" />Tax Code:</strong>
          <span>{invoice.tax_code || 'N/A'}</span>
        </div>
        <div>
          <strong className="text-muted-foreground flex items-center"><Percent className="w-4 h-4 mr-1.5" />Total Tax:</strong>
          <span>{formatCurrency(invoice.total_tax)}</span>
        </div>
        <div>
          <strong className="text-muted-foreground flex items-center"><DollarSign className="w-4 h-4 mr-1.5" />Total Bill:</strong>
          <span>{formatCurrency(invoice.total_bill)}</span>
        </div>
        <div>
          <strong className="text-muted-foreground flex items-center"><CalendarDays className="w-4 h-4 mr-1.5" />Created:</strong>
          <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {invoice.file_id ? (
        <Link
          href={`/dashboard/files/${invoice.file_id}`}
          className="inline-flex items-center text-sm text-primary hover:underline mt-2"
        >
          <FileText className="w-4 h-4 mr-1.5" />
          View Associated File (ID: {invoice.file_id})
        </Link>
      ) : (
        <p className="text-sm text-muted-foreground flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1.5 text-orange-500" />
            No associated file.
        </p>
      )}
    </div>
  );
} 