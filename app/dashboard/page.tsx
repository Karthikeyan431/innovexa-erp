import type { Metadata } from "next";
import { AccountPanel } from "@/components/account-panel";
import { AuthCard } from "@/components/auth-ui";
import { authText } from "@/lib/auth-text";

export const metadata: Metadata = { title: "Dashboard · Innovexa ERP" };

export default function DashboardPage() {
  return (
    <AuthCard title={authText.appName}>
      <AccountPanel />
    </AuthCard>
  );
}
