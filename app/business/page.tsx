import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-ui";
import { BusinessForm } from "@/components/business-form";
import { businessText } from "@/lib/business-text";

export const metadata: Metadata = { title: "Business profile · Innovexa ERP" };

export default function BusinessPage() {
  return (
    <AuthCard title={businessText.pageTitle}>
      <BusinessForm />
    </AuthCard>
  );
}
