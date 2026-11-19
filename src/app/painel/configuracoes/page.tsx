import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { ThemeEditor } from "@/components/dashboard/theme-editor";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Configurações"
        description="Ajuste cores, tipografia e a identidade visual da loja."
      />
      <ThemeEditor />
    </>
  );
}
