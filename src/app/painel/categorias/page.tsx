import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { CategoryManager } from "@/components/dashboard/category-manager";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return (
    <>
      <PageHeading
        title="Categorias"
        description="Organize o catálogo em coleções para os clientes encontrarem mais rápido."
      />
      <CategoryManager />
    </>
  );
}
