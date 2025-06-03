"use client";

import { FilesTable } from '@/components/files-table';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

// Define the structure of a file object based on your table schema
export interface File {
  id: number;
  created_at: string;
  name: string ;
  size_bytes: number ;
  mime_type: string ;
  user_id: string ;
  job_id: number ;
}

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial files
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
      } else if (data) {
        setFiles(data as File[]);
      }
    };

    fetchFiles();

    const channel = supabase
    .channel('table-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'files',
      },
      (payload) => {
        console.log(payload);
        if (payload.eventType === 'INSERT') {
        console.log('INSERT :');
          setFiles((prevFiles) => [payload.new as File,...prevFiles]);
        }
        if (payload.eventType === 'UPDATE') {
          setFiles((prevFiles) => prevFiles.map(file => file.id === payload.new.id ? payload.new as File : file));
        }
        if (payload.eventType === 'DELETE') {
          setFiles((prevFiles) => prevFiles.filter(file => file.id !== payload.old.id));
        }
      }
    )
    .subscribe()

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
  return (
    <div className="flex flex-col gap-4 px-4  ">
      <FilesTable data={files} />
    </div>
  );
}