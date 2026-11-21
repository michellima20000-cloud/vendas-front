"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, isMissingStoreError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Order, Paginated, Product, Store as StoreType } from "@/types/api";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export function DashboardOverview() {
  const { token, user } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [orders, setOrders] = useState<Paginated<Order> | null>(null);
  const [products, setProducts] = useState<Paginated<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const nextStore = await api.myStore(token as string);
        setStore(nextStore);
        const [orderResult, productResult] = await Promise.all([
          api.getStoreOrders(token as string, 1, 5),
          api.getMyProducts(token as string, 1, 1),
        ]);
        setOrders(orderResult);
        setProducts(productResult);
      } catch (requestError) {
        if (isMissingStoreError(requestError)) {
          setStore(null);
        } else {
          setError(requestError instanceof Error ? requestError.message : "Erro ao carregar o painel");
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [token]);

  if (isLoading) {
    return <LoaderCircle className="animate-spin text-primary" size={30} />;
  }

  if (!store) {
    return (
      <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-primary">
          <Store size={30} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-text-title">
          Vamos montar sua loja, {user?.name.split(" ")[0]}?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
          Primeiro, crie os dados principais da sua vitrine. Depois você poderá adicionar produtos e acompanhar pedidos.
        </p>
        <Link href="/painel/loja" className="btn-primary mt-6">
          Criar minha loja <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  const revenue = (orders?.data ?? []).reduce((sum, order) => sum + order.total, 0);
  const pending = (orders?.data ?? []).filter((order) => order.status === "PENDING").length;

  return (
    <div className="space-y-7">
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CircleDollarSign}
          label="Vendas recentes"
          value={formatCurrency(revenue)}
          note="Nos últimos pedidos"
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={ShoppingBag}
          label="Pedidos"
          value={String(orders?.total ?? 0)}
          note={`${pending} aguardando ação`}
          color="text-primary bg-primary-light"
        />
        <StatCard
          icon={Package}
          label="Produtos"
          value={String(products?.total ?? 0)}
          note="No seu catálogo"
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={Clock3}
          label="Último pedido"
          value={orders?.data[0] ? formatDate(orders.data[0].createdAt) : "Ainda não"}
          note={orders?.data[0]?.status ? statusLabels[orders.data[0].status] : "Comece vendendo"}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-text-title">Pedidos recentes</h2>
              <p className="text-xs text-text-secondary">Acompanhe as últimas vendas da sua loja.</p>
            </div>
            <Link href="/painel/pedidos" className="text-sm font-bold text-primary hover:underline">
              Ver todos
            </Link>
          </div>

          {orders && orders.data.length > 0 ? (
            <div className="divide-y divide-primary/10">
              {orders.data.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-title">
                      Pedido #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} itens · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-text-title">{formatCurrency(order.total)}</p>
                    <span className="mt-1 inline-flex rounded-pill bg-primary-light px-2.5 py-1 text-[10px] font-black text-primary">
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <ShoppingBag size={30} className="mx-auto text-primary/35" />
              <p className="mt-3 text-sm font-bold text-text-title">Nenhum pedido ainda</p>
              <p className="mt-1 text-xs text-text-secondary">Seus pedidos aparecerão aqui.</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-primary p-6 text-white shadow-card-hover">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">Sua vitrine</p>
          <h2 className="mt-3 font-display text-2xl font-bold">{store.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-white/70">
            {store.description || "Adicione uma descrição para apresentar sua loja aos clientes."}
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <Link href="/painel/produtos" className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15">
              Gerenciar produtos <ArrowRight size={16} />
            </Link>
            <Link href="/painel/configuracoes" className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15">
              Editar apresentação <ArrowRight size={16} />
            </Link>
            <a
              href={`/loja/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
            >
              Ver loja publicada <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  color,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">{label}</p>
          <p className="mt-2 truncate font-display text-2xl font-bold text-text-title">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{note}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${color}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}
