import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-ui";
import { LoginForm } from "@/components/login-form";
import { authText } from "@/lib/auth-text";

export const metadata: Metadata = { title: "Log in · Innovexa ERP" };

export default function LoginPage() {
  return (
    <AuthCard title={authText.loginTitle}>
      <LoginForm />
    </AuthCard>
  );
}
