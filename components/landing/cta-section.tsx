"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileCheck2 } from "lucide-react";

export function CallToActionSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full py-12 md:py-24 lg:py-32 bg-muted/70">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Ready to Validate Your First Invoice?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Stop worrying about invoice errors. Get started now and experience the fastest, most reliable way to check your documents.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard/new-job">
              Upload Your Invoice
              <FileCheck2 className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#contact">
              Contact Sales
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 