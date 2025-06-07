"use client";

import { StatusBadge } from '@/components/status-badge';
import { Hash, Tag, Percent, DollarSign, CheckCircle, XCircle, Loader2, ShieldCheck, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { checkInvoiceValidity, saveInvoice } from '@/app/dashboard/files/[id]/actions';

interface ValidityResult {
  isValid: boolean;
  message?: string;
  checkedAt?: Date;
}

export interface Invoice {
  id: number;
  created_at: string;
  invoice_number: string ;
  invoice_symbol: string ;
  tax_code: string ;
  total_tax: number ;
  total_bill: number ;
  status: string ;
  file_id: number ; // Remains, though not displayed as per previous change
  is_valid: boolean ; // Added for displaying pre-existing validity
  validity_message: string | null; // Added for displaying pre-existing validity message
  validity_checked_at: string | null; // Added for displaying pre-existing validity check date
  updated_at: Date;

}


interface InvoiceItemProps {
  invoice: Invoice;
}


export function InvoiceItem({ invoice }: InvoiceItemProps) {
  const [isValidityLoading, setIsValidityLoading] = useState(false);
  const [validityResult, setValidityResult] = useState<ValidityResult | null>(null);
  const [validityError, setValidityError] = useState<string | null>(null);
  const [editableInvoiceData, setEditableInvoiceData] = useState<Invoice>(invoice);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setEditableInvoiceData(invoice);
    // Reset validityResult when invoice prop changes to show initial status from new invoice data
    setValidityResult(null); 
    setValidityError(null);
  }, [invoice]);

  const handleInputChange = (field: keyof Invoice, value: string | number | null) => {
    setEditableInvoiceData(prev => ({ ...prev, [field]: value }));
    setSaveError(null);
  };

  const handleCheckValidity = async () => {
    setIsValidityLoading(true);
    setValidityError(null);
    setValidityResult(null); // Clear previous results before fetching new one
    try {
      const result = await checkInvoiceValidity(editableInvoiceData); 
      setValidityResult(result);
    } catch (error) {
      console.error("Error checking invoice validity:", error);
      setValidityError("Failed to check validity. Please try again.");
    }
    setIsValidityLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      console.log("Saving invoice data:", editableInvoiceData);
      const savedInvoice = await saveInvoice(editableInvoiceData);
      console.log("Invoice saved:", savedInvoice);
    } catch (err) {
      console.error("Error saving invoice:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to save invoice.");
    }
    setIsSaving(false);
  };

  // Determine initial validity display from invoice prop if button hasn't been clicked
  const initialIsValid = validityResult === null && invoice.is_valid !== null ? invoice.is_valid : null;
  const initialValidityMessage = validityResult === null && invoice.is_valid !== null 
    ? invoice.validity_message || (invoice.is_valid ? 'Invoice is valid (initial)' : 'Invoice is not valid (initial)') 
    : null;
  const initialValidityCheckedAt = validityResult === null && invoice.is_valid !== null && invoice.validity_checked_at 
    ? new Date(invoice.validity_checked_at).toLocaleString() 
    : null;

  return (
    <div className="bg-card p-4 shadow rounded-lg border border-border relative">
      {/* Invoice Number and Symbol with explicit labels */}
      <div className="flex flex-col sm:flex-row gap-x-4 gap-y-3 mb-4">
        <div className="flex-1 min-w-0">
          <Label htmlFor={`invoice_number-${invoice.id}`} className="flex items-center text-muted-foreground font-medium mb-1">
            <Hash className="w-4 h-4 mr-1.5" />Invoice number:
          </Label>
          <Input
            id={`invoice_number-${invoice.id}`}
            value={editableInvoiceData.invoice_number || ''}
            onChange={(e) => handleInputChange('invoice_number', e.target.value)}
            className="text-base h-10 dark:bg-input/50 w-full"
            placeholder="00000000"
            disabled={isSaving}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Label htmlFor={`invoice_symbol-${invoice.id}`} className="flex items-center text-muted-foreground font-medium mb-1">
            <Tag className="w-4 h-4 mr-1.5" />Symbol:
          </Label>
          <Input
            id={`invoice_symbol-${invoice.id}`}
            value={editableInvoiceData.invoice_symbol || ''}
            onChange={(e) => handleInputChange('invoice_symbol', e.target.value)}
            className="text-base h-10 dark:bg-input/50 w-full"
            placeholder="SYMBOL"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Data Fields Grid - Ensuring 3 columns on sm screens and up */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4 text-sm mb-4">
        <div>
          <Label htmlFor={`tax_code-${invoice.id}`} className="flex items-center text-muted-foreground font-medium mb-1"><Tag className="w-4 h-4 mr-1.5" />Tax Code:</Label>
          <Input 
              id={`tax_code-${invoice.id}`}
              value={editableInvoiceData.tax_code || ''} 
              onChange={(e) => handleInputChange('tax_code', e.target.value)}
              placeholder="Tax Code" 
              className="h-10 dark:bg-input/50"
              disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor={`total_tax-${invoice.id}`} className="flex items-center text-muted-foreground font-medium mb-1"><Percent className="w-4 h-4 mr-1.5" />Total Tax:</Label>
          <Input 
            type="text"
            id={`total_tax-${invoice.id}`}
            value={editableInvoiceData.total_tax || ''} 
            onChange={(e) => handleInputChange('total_tax', e.target.value)}
            placeholder="0,00"
            className="h-10 dark:bg-input/50"
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor={`total_bill-${invoice.id}`} className="flex items-center text-muted-foreground font-medium mb-1"><DollarSign className="w-4 h-4 mr-1.5" />Total Bill:</Label>
          <Input 
            type="text"
            id={`total_bill-${invoice.id}`}
            value={editableInvoiceData.total_bill || ''} 
            onChange={(e) => handleInputChange('total_bill', e.target.value)}
            placeholder="0,00"
            className="h-10 dark:bg-input/50"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Invoice Status Display - New Location */}
      {invoice.status && (
        <div className="mt-1 mb-3 flex justify-start items-center">
          <span className="text-sm text-muted-foreground mr-2">Status:</span>
          <StatusBadge status={invoice.status} />
        </div>
      )}

      {/* Action Buttons Area */}
      <div className="pt-4 mt-1 border-t border-border/50 flex flex-wrap items-center justify-start gap-2">
        <Button onClick={handleSave} disabled={isSaving} size="sm" variant="default" className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-white">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save'} {/* User updated this text */}
        </Button>
        <Button 
            onClick={handleCheckValidity} 
            disabled={isValidityLoading || isSaving}
            size="sm"
            variant="outline"
        >
            {isValidityLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            {isValidityLoading ? 'Checking...' : 'Check Validity'}
        </Button>
      </div>
      
      {/* Error and Validity Result Display Area */}
      {saveError && (
         <p className="mt-3 text-xs text-destructive flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> {saveError}
        </p>
      )}

      {validityError && (
        <p className="mt-3 text-xs text-destructive flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> {validityError}
        </p>
      )}

      {/* Display dynamic validity result OR initial validity from invoice prop */}
      {validityResult ? (
        <div className={`mt-3 text-xs flex items-center p-2 rounded-md ${validityResult.isValid ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
          {validityResult.isValid ? 
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> : 
            <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
          }
          <span>
            {validityResult.message || (validityResult.isValid ? 'Invoice is valid.' : 'Invoice is not valid.')}
            {validityResult.checkedAt && 
                <span className="block text-muted-foreground text-[0.7rem]">Checked: {new Date(validityResult.checkedAt).toLocaleString()}</span>
            }
          </span>
        </div>
      ) : initialIsValid !== null ? (
        <div className={`mt-3 text-xs flex items-center p-2 rounded-md ${initialIsValid ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
          {initialIsValid ? 
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> : 
            <XCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
          }
          <span>
            {initialValidityMessage}
            {initialValidityCheckedAt && 
                <span className="block text-muted-foreground text-[0.7rem]">Checked: {initialValidityCheckedAt}</span>
            }
          </span>
        </div>
      ) : null}
    </div>
  );
} 