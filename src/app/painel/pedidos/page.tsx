import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { OrdersManager } from "@/components/dashboard/orders-manager";

export const metadata: Metadata = { title: "Pedidos" };

export default function OrdersPage() {
  return (
    <>
      <PageHeading
        title="Pedidos"
        description="Acompanhe as vendas e atualize o andamento de cada pedido."
      />
      <OrdersManager />
    </>
  );
}
