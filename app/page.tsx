import { SetupNotice } from "@/components/setup-notice";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Innovexa ERP</h1>
      <SetupNotice />
    </main>
  );
}
