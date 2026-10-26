"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Bilingual } from "@/components/bilingual";
import { Field, Message, SubmitButton } from "@/components/auth-ui";
import { authErrorText, authText, type BilingualText } from "@/lib/auth-text";
import { getSupabaseClient } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<BilingualText | null>(null);

  // Already logged in: skip the form.
  useEffect(() => {
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/dashboard");
      });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    setBusy(true);
    setError(null);
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) {
        setError(authErrorText(error));
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(authErrorText(err as Error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field id="email" name="email" type="email" label={authText.email} autoComplete="email" required />
      <Field
        id="password"
        name="password"
        type="password"
        label={authText.password}
        autoComplete="current-password"
        required
      />
      {error && <Message text={error} tone="error" />}
      <SubmitButton busy={busy} label={authText.loginButton} />
      <p className="text-sm">
        <Bilingual text={authText.noAccount} />
        <Link href="/signup" className="mt-1 inline-block font-medium underline underline-offset-4">
          {authText.signupTitle.ta} · {authText.signupTitle.en}
        </Link>
      </p>
    </form>
  );
}
