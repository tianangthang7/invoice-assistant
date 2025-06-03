"use server";

import axios from "axios";

// create a job

interface IFile {
  user_id: string;
  name: string;
  size_bytes: number;
  mime_type: string;
  job_id: string;
  path: string;
}

export async function createJob(file: IFile) {
  const server_url = process.env.INVOICE_SERVER_URL;
  console.log("file :", JSON.stringify(file));
  try {
    const response = await axios.post(`${server_url}/llm-parser/parse`, file);
    console.log("data :", response.data);
  } catch (error) {
    console.error("Error calling llm-parser:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
  }
}
