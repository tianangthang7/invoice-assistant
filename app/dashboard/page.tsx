"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Define a type for the user information we expect from Supabase
interface AppUser {
  name: string;
  email: string;
  avatar: string;
}

export default function Page() {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "No email provided",
          avatar: session.user.user_metadata?.avatar_url || "",
        });
      } else {
        setUser(null);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
            email: session.user.email || "No email provided",
            avatar: session.user.user_metadata?.avatar_url || "",
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 p-4">
      <h1 className="text-2xl font-bold">Sample Dashboard Page</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Email: {user.email}</p>
          {/* You can add user.avatar here if you have an Image component */}
        </div>
      ) : (
        <p>Please log in to see your information.</p>
      )}
      <p>This is a sample page within the dashboard layout.</p>
      <div className="rounded-lg border border-dashed border-gray-200 p-4 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Content for the sample page goes here.
        </p>
      </div>
    </div>
  );
} 