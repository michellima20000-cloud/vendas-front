import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { ProductManager } from "@/components/dashboard/product-manager";

export const metadata: Metadata = { title: "Produtos" };

export default function ProductsPage() {
  return (
    <>
      <PageHeading
        title="Produtos"
        description="Cadastre, edite e organize os itens da sua vitrine."
      />
      <ProductManager />
    </>
  );
}
