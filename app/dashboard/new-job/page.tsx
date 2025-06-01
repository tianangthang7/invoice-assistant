"use client"

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';

export default function QuickCreatePage() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user; 

    // create a job
    const { data: jobData, error: jobError } = await supabase.from('jobs').insert({
      user_id: user?.id,
      name: 'New Job ' + new Date().toISOString(),
      status: 'pending',
    }).select().single();

    if (jobError) {
      console.error("Supabase insert error:", jobError);
    } else {
      console.log("Supabase insert success:", jobData);
    }

    if (acceptedFiles.length > 0) {
      const fileToUpload = acceptedFiles[0];
      const { data, error } = await supabase.from('files').insert({
        user_id: user?.id,
        name: fileToUpload.name,
        size_bytes: fileToUpload.size, 
        mime_type: fileToUpload.type,  
        job_id: jobData?.id,
      });

      if (error) {  
        console.error("Supabase insert error:", error);
      } else {
        console.log("Supabase insert success:", data);
      }
    }
    }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    noClick: true,
    noKeyboard: true
  });

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-muted-foreground" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-muted-foreground" />;
    }
    return <FileText className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-background text-foreground">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-accent' : 'border-input hover:border-primary/70 bg-card'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="mb-2 text-lg font-semibold text-center">
          Drag and drop files here
        </p>
        <p className="text-sm text-muted-foreground text-center">PDFs and images only (JPG, PNG)</p>
        <Button
          type="button"
          onClick={open}
          className="mt-4"
        >
          Browse Files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="w-full mt-6">
          <h3 className="text-lg font-semibold mb-2">Uploaded Files:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3 rounded-md border border-border bg-card">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 