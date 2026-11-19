import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = { title: "Visão geral" };

export default function DashboardPage() {
  return (
    <>
      <PageHeading
        title="Visão geral"
        description="Acompanhe o desempenho da sua loja em um só lugar."
      />
      <DashboardOverview />
    </>
  );
}
