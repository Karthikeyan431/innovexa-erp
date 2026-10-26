"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Bilingual } from "@/components/bilingual";
import { Field, Message, SubmitButton } from "@/components/auth-ui";
import {
  accountExistsText,
  authErrorText,
  authText,
  MIN_PASSWORD_LENGTH,
  type BilingualText,
} from "@/lib/auth-text";
import { getSupabaseClient } from "@/lib/supabase";

export function SignupForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<BilingualText | null>(null);
  const [emailSent, setEmailSent] = useState(false);

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
    const confirmPassword = String(form.get("confirmPassword"));

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(authText.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(authText.passwordsDontMatch);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const { data, error } = await getSupabaseClient().auth.signUp({ email, password });
      if (error) {
        setError(authErrorText(error));
        return;
      }
      // With email confirmation on, Supabase hides existing accounts by
      // returning a user with no identities instead of an error.
      if (data.user && data.user.identities?.length === 0) {
        setError(accountExistsText);
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
        return;
      }
      setEmailSent(true);
    } catch (err) {
      setError(authErrorText(err as Error));
    } finally {
      setBusy(false);
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col gap-4">
        <Message text={authText.checkEmail} tone="success" />
        <Link
          href="/login"
          className="flex min-h-12 items-center justify-center rounded-lg bg-zinc-900 px-4 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {authText.loginTitle.ta} · {authText.loginTitle.en}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field id="email" name="email" type="email" label={authText.email} autoComplete="email" required />
      <Field
        id="password"
        name="password"
        type="password"
        label={authText.password}
        hint={authText.passwordHint}
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      <Field
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label={authText.confirmPassword}
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      {error && <Message text={error} tone="error" />}
      <SubmitButton busy={busy} label={authText.signupButton} />
      <p className="text-sm">
        <Bilingual text={authText.haveAccount} />
        <Link href="/login" className="mt-1 inline-block font-medium underline underline-offset-4">
          {authText.loginTitle.ta} · {authText.loginTitle.en}
        </Link>
      </p>
    </form>
  );
}
