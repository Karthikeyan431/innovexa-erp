"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Returns the logged-in user, or null while checking.
 * Sends guests (and anyone who logs out, even in another tab) to /login.
 */
export function useRequireUser(): User | null {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
      else router.replace("/login");
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  return user;
}
