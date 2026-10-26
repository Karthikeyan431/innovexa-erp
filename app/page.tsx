import Link from "next/link";
import { SetupNotice } from "@/components/setup-notice";
import { authText } from "@/lib/auth-text";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Innovexa ERP</h1>
      <SetupNotice />
      <nav className="flex w-full max-w-xs flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {authText.loginTitle.ta} · {authText.loginTitle.en}
        </Link>
        <Link
          href="/signup"
          className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-zinc-300 px-4 font-medium dark:border-zinc-700"
        >
          {authText.signupTitle.ta} · {authText.signupTitle.en}
        </Link>
      </nav>
    </main>
  );
}
