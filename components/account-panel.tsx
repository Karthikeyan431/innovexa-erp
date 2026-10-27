"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bilingual } from "@/components/bilingual";
import { LinkButton, Message } from "@/components/auth-ui";
import { authErrorText, authText, type BilingualText } from "@/lib/auth-text";
import { businessText } from "@/lib/business-text";
import { itemsText } from "@/lib/items-text";
import { getSupabaseClient } from "@/lib/supabase";
import { useRequireUser } from "@/lib/use-require-user";

/** Shows the logged-in email and a logout button. Sends guests to /login. */
export function AccountPanel() {
  const router = useRouter();
  const user = useRequireUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<BilingualText | null>(null);

  async function handleLogout() {
    setBusy(true);
    setError(null);
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      setError(authErrorText(error));
      setBusy(false);
      return;
    }
    router.replace("/login");
  }

  if (!user) {
    return <Bilingual text={authText.loading} className="text-sm opacity-70" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-800">
        <Bilingual text={authText.loggedInAs} className="text-sm" />
        <p className="mt-1 break-all font-medium">{user.email}</p>
      </div>
      <LinkButton href="/items" text={itemsText.openItems} />
      <LinkButton href="/business" text={businessText.openBusinessProfile} variant="secondary" />
      {error && <Message text={error} tone="error" />}
      <button
        type="button"
        onClick={handleLogout}
        disabled={busy}
        className="min-h-12 w-full rounded-lg border border-zinc-300 px-4 py-2 font-medium transition-opacity disabled:opacity-60 dark:border-zinc-700"
      >
        <Bilingual text={busy ? authText.pleaseWait : authText.logoutButton} className="items-center" />
      </button>
    </div>
  );
}
