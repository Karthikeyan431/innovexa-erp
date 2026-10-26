import { connection } from "next/server";
import { Suspense } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type CheckResult = { ok: boolean; message: string; detail?: string };

async function checkConnection(): Promise<CheckResult> {
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (error) {
    return { ok: false, message: "Supabase is not configured.", detail: (error as Error).message };
  }

  try {
    // Not signed in, so row-level security hides every row. No error means
    // the database is reachable and the table exists. A HEAD request
    // (head: true) is avoided because it hides "table not found" errors.
    const { error } = await supabase.from("businesses").select("id").limit(1);

    if (error) {
      const missingTable = error.code === "PGRST205" || error.code === "42P01";
      return {
        ok: false,
        message: missingTable
          ? "Connected to Supabase, but the businesses table was not found. Apply the migration in supabase/migrations."
          : "Connected to Supabase, but the query failed.",
        detail: [error.code, error.message].filter(Boolean).join(": "),
      };
    }

    return {
      ok: true,
      message: "Database connection works. The businesses table is reachable and protected by row-level security.",
    };
  } catch (error) {
    return { ok: false, message: "Could not reach Supabase.", detail: (error as Error).message };
  }
}

async function ConnectionStatus() {
  // Run the check on every request instead of at build time.
  await connection();
  const result = await checkConnection();

  return (
    <div
      className={cn(
        "max-w-xl rounded-md border px-4 py-3 text-sm",
        result.ok
          ? "border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-200"
          : "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200",
      )}
    >
      <p className="font-medium">{result.ok ? "Connected" : "Not connected"}</p>
      <p className="mt-1">{result.message}</p>
      {result.detail && <p className="mt-2 font-mono text-xs opacity-80">{result.detail}</p>}
    </div>
  );
}

export default function TestConnectionPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Supabase connection test</h1>
      <Suspense fallback={<p className="text-sm opacity-70">Checking connection…</p>}>
        <ConnectionStatus />
      </Suspense>
    </main>
  );
}
