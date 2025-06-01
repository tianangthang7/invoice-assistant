"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, FileText, MountainIcon } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { LandingNavUser } from "@/components/landing/landing-nav-user";

export function LandingNavbar() {
  return (
    <header className="px-4 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Invoice Auto
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              href="#features"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Features
            </Link>
            <Link
              href="#pricing" // Example link, adjust as needed
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Pricing
            </Link>
            <Link
              href="#contact" // Example link, adjust as needed
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pt-10">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <MountainIcon className="h-6 w-6" />
                    <span className="sr-only">Invoice Auto</span>
                  </Link>
                  <Link href="#features" className="hover:text-foreground/80">
                    Features
                  </Link>
                  <Link href="#pricing" className="hover:text-foreground/80">
                    Pricing
                  </Link>
                  <Link href="#contact" className="hover:text-foreground/80">
                    Contact
                  </Link>
                  <Separator className="my-4" />
                  <div className="flex justify-center">
                     <LandingNavUser />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden items-center space-x-2 md:flex">
             <ModeToggle />
             <LandingNavUser />
          </div>
          <div className="flex items-center space-x-2 md:hidden">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
} 