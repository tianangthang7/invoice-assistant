"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  const lowerCaseStatus = status?.toLowerCase();

  if (lowerCaseStatus === "completed" || lowerCaseStatus === "success") {
    variant = "default";
  } else if (lowerCaseStatus === "failed" || lowerCaseStatus === "error") {
    variant = "destructive";
  } else if (lowerCaseStatus === "pending" || lowerCaseStatus === "processing" || lowerCaseStatus === "running") {
    variant = "outline";
  }
  // Add more status mappings as needed, e.g., "warning" for certain statuses

  return (
    <Badge variant={variant} className="capitalize">
      {status || "N/A"}
    </Badge>
  );
} 