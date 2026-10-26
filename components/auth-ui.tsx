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

type FieldProps = { label: BilingualText; hint?: BilingualText } & ComponentProps<"input">;

export function Field({ label, hint, id, className, ...inputProps }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        <Bilingual text={label} />
      </label>
      <input
        id={id}
        className={cn(
          // text-base (16px) stops phones from zooming in on focus.
          "min-h-12 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20",
          className,
        )}
        {...inputProps}
      />
      {hint && <Bilingual text={hint} className="text-xs opacity-80" />}
    </div>
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
