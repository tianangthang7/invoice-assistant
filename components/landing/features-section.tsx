"use client";

import { UploadCloud, ScanText, ShieldCheck, Zap, Clock, FileText } from "lucide-react"; // Updated icons

const features = [
  {
    icon: <UploadCloud className="h-10 w-10 text-primary" />,
    title: "Easy Uploads",
    description: "Quickly upload your invoices in various formats. Drag and drop or browse files with ease.",
  },
  {
    icon: <ScanText className="h-10 w-10 text-primary" />,
    title: "Instant Validation",
    description: "Our AI-powered system checks for common errors, compliance issues, and data accuracy in seconds.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: "Accuracy Assured",
    description: "Reduce manual errors and ensure your invoice data is correct before processing.",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Fast Processing",
    description: "Save time with automated checks that speed up your entire accounts payable workflow.",
  },
   {
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "24/7 Availability",
    description: "Upload and validate invoices anytime, anywhere. Our service is always online for you.",
  },
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: "Clear Reporting",
    description: "Get straightforward reports on validation results, highlighting any potential issues found.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="flex flex-col items-center justify-center w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Validate Invoices in 3 Simple Steps
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform simplifies invoice checking. Just upload your file, let our AI analyze it, and receive instant feedback on its validity.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 pt-12">
          {features.map((feature) => (
            <div key={feature.title} className="grid gap-2 p-4 rounded-lg border border-border/50 hover:shadow-lg transition-shadow bg-card">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 