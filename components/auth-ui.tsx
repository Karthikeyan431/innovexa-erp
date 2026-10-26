import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Bilingual } from "@/components/bilingual";
import { authText, type BilingualText } from "@/lib/auth-text";
import { cn } from "@/lib/utils";

/** Full-width card on phones, centred fixed-width card on larger screens. */
export function AuthCard({ title, children }: { title: BilingualText; children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-sm sm:rounded-xl sm:border sm:border-zinc-200 sm:p-6 sm:dark:border-zinc-800">
        <p className="mb-6 text-sm font-medium opacity-70">
          {authText.appName.ta} · {authText.appName.en}
        </p>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          <Bilingual text={title} />
        </h1>
        {children}
      </div>
    </main>
  );
}

type FieldShellProps = {
  id?: string;
  label: BilingualText;
  hint?: BilingualText;
  error?: BilingualText;
  children: ReactNode;
};

/** Label, control, hint and error message for one form field. */
export function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        <Bilingual text={label} />
      </label>
      {children}
      {hint && !error && <Bilingual text={hint} className="text-xs opacity-80" />}
      {error && (
        <Bilingual id={id ? `${id}-error` : undefined} text={error} className="text-xs text-red-700 dark:text-red-400" />
      )}
    </div>
  );
}

// text-base (16px) stops phones from zooming in on focus.
const controlClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20";

type FieldProps = { label: BilingualText; hint?: BilingualText; error?: BilingualText } & ComponentProps<"input">;

export function Field({ label, hint, error, id, className, ...inputProps }: FieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn("min-h-12", controlClass, className)}
        {...inputProps}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = { label: BilingualText; hint?: BilingualText; error?: BilingualText } & ComponentProps<"textarea">;

export function TextAreaField({ label, hint, error, id, className, ...textareaProps }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn("min-h-24 py-2", controlClass, className)}
        {...textareaProps}
      />
    </FieldShell>
  );
}

/** A link styled like a full-width button. */
export function LinkButton({ href, text, variant = "primary" }: { href: string; text: BilingualText; variant?: "primary" | "secondary" }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-12 w-full items-center justify-center rounded-lg px-4 py-2 font-medium",
        variant === "primary"
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "border border-zinc-300 dark:border-zinc-700",
      )}
    >
      <Bilingual text={text} className="items-center" />
    </Link>
  );
}

export function SubmitButton({ busy, label }: { busy: boolean; label: BilingualText }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="min-h-12 w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-opacity disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
    >
      <Bilingual text={busy ? authText.pleaseWait : label} className="items-center" />
    </button>
  );
}

export function Message({ text, tone }: { text: BilingualText; tone: "error" | "success" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "error"
          ? "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
          : "border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-200",
      )}
    >
      <Bilingual text={text} />
    </div>
  );
}
