"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconLogout, IconUserCircle } from "@tabler/icons-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface AppUser {
  name: string;
  email: string;
  avatar: string;
}

export function LandingNavUser() {
  const isMobile = useIsMobile();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User",
          email: session.user.email || "No email provided",
          avatar: session.user.user_metadata?.avatar_url || "",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User",
          email: session.user.email || "No email provided",
          avatar: session.user.user_metadata?.avatar_url || "",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false); // Also set loading to false on auth state change
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/"); // Redirect to home page after logout
  };

  if (isLoading) {
    // You can render a small skeleton or loader here if desired
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button asChild size="sm">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button variant="outline" asChild size="sm">
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isMobile && <span className="text-sm font-medium truncate max-w-[100px]">{user.name}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard')}> {/* Example: Redirect to dashboard */}
            <IconUserCircle className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 