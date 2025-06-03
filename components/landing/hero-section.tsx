"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileCheck2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-muted/50 to-background">
      <div className="px-4 md:px-6 container">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                Simplify Your Invoice Validation
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-auto">
                Effortlessly upload and instantly validate your invoices. Ensure accuracy and compliance with our intelligent checking system.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-center">
              <Button asChild size="lg">
                <Link href="/dashboard/new-job">
                  Upload Invoice
                  <FileCheck2 className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">
                  How It Works
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
             <div className="w-[400px] h-[300px] xl:w-[550px] xl:h-[450px] bg-muted rounded-lg flex items-center justify-center">
                <FileCheck2 className="w-32 h-32 text-primary/70" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
} 