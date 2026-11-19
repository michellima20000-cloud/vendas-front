import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StoreManager } from "@/components/dashboard/store-manager";

export const metadata: Metadata = { title: "Minha loja" };

export default function StoreSettingsPage() {
  return (
    <>
      <PageHeading
        title="Minha loja"
        description="Crie e personalize os dados que aparecem na sua vitrine."
      />
      <StoreManager />
    </>
  );
}
