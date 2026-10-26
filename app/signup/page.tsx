import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-ui";
import { SignupForm } from "@/components/signup-form";
import { authText } from "@/lib/auth-text";

export const metadata: Metadata = { title: "Sign up · Innovexa ERP" };

export default function SignupPage() {
  return (
    <AuthCard title={authText.signupTitle}>
      <SignupForm />
    </AuthCard>
  );
}
