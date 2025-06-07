"use client"

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import { createJob } from './action';
import { JobFileItem } from '@/components/job-file-item';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickCreatePage() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
  console.log('QuickCreatePage 3');

    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);

    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user; 

    // create a job
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = now.getFullYear();
    const formattedDate = `${hours}:${minutes} ${day}/${month}/${year}`;

    const { data: jobData, error: jobError } = await supabase.from('jobs').insert({
      user_id: user?.id,
      name: 'Job ' + formattedDate,
      status: 'pending',
    }).select().single();

    if (jobError) {
      console.error("Supabase insert error:", jobError);
    } else {
      console.log("Supabase insert success:", jobData);
    }

    if (acceptedFiles.length > 0) {
      acceptedFiles.forEach(async (fileToUpload) => {
      // upload the file to supabase storage
      //
      const { data: storageData, error: storageError } =
       await supabase.storage.from('files').upload(fileToUpload.name, fileToUpload,
        {
          upsert: true,
        }
       );

      if (storageError) {
        console.error("Supabase storage upload error:", storageError);
        // Early return or throw error if storage upload is critical for the next step
        return; 
      } else {
        console.log("Supabase storage upload success:", storageData);
      }

      // Ensure storageData and storageData.fullPath are valid before using them
      if (!storageData || !storageData.fullPath) {
       console.error("File upload to storage did not return a valid path. storageData:", storageData);
       // Handle this error appropriately - maybe don't proceed with DB insert
       return;
      }

       const { data, error } = await supabase.from('files').insert({
         user_id: user?.id,
         name: fileToUpload.name,
         size_bytes: fileToUpload.size, 
         mime_type: fileToUpload.type,  
         job_id: jobData?.id,
         full_path: storageData.fullPath, 
         path: storageData.path,
         status: 'pending',
      }).select().single();
      // update files state with the new file, replace the file with the new one
      setFiles(prevFiles => prevFiles.map(file => file.name === fileToUpload.name ? data : file));
      if (error) {  
       console.error("Supabase insert error for 'files' table:", error);
       // If insert fails, data might be null or undefined.
       // createJob would then receive null/undefined.
      } else if (!data) {
       console.error("Supabase insert into 'files' table succeeded but returned no data. This could be RLS or an issue with .select().single().");
      } else {
       console.log("Supabase insert success for 'files' table:", data);
          createJob(data);
        }
      });
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent>
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
            <p className="text-sm text-muted-foreground text-center mb-4">PDFs and images only (JPG, PNG)</p>
            <Button
              type="button"
              onClick={open}
              className="mt-2"
            >
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files List Section */}
      {files.length > 0 && (
        <Card>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => (
                <JobFileItem key={index} file={file} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}