import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-ui";
import { ItemsManager } from "@/components/items-manager";
import { itemsText } from "@/lib/items-text";

export const metadata: Metadata = { title: "Items · Innovexa ERP" };

export default function ItemsPage() {
  return (
    <AuthCard title={itemsText.pageTitle}>
      <ItemsManager />
    </AuthCard>
  );
}
