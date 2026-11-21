"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, PackageCheck, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, isMissingStoreError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Order, OrderStatus, Paginated } from "@/types/api";

const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
];

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export function OrdersManager() {
  const { token } = useAuth();
  const [result, setResult] = useState<Paginated<Order> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [missingStore, setMissingStore] = useState(false);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      setResult(await api.getStoreOrders(token, 1, 100));
      setMissingStore(false);
    } catch (requestError) {
      if (isMissingStoreError(requestError)) {
        setMissingStore(true);
      } else {
        setError(requestError instanceof Error ? requestError.message : "Erro ao carregar pedidos");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function updateStatus(order: Order, status: OrderStatus) {
    if (!token) return;
    setError("");
    try {
      const updated = await api.updateOrderStatus(token, order.id, status);
      setResult((current) =>
        current
          ? {
              ...current,
              data: current.data.map((item) => (item.id === updated.id ? updated : item)),
            }
          : current,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o pedido");
    }
  }

  if (isLoading) return <LoaderCircle className="animate-spin text-primary" size={28} />;

  if (missingStore) {
    return (
      <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-primary">
          <ShoppingBag size={30} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-text-title">
          Você ainda não tem uma loja
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Crie sua loja para acompanhar os pedidos da sua vitrine.
        </p>
        <Link href="/painel/loja" className="btn-primary mt-6">
          Criar minha loja
        </Link>
      </div>
    );
  }

  if (!result?.data.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-primary">
          <ShoppingBag size={30} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-text-title">Nenhum pedido por aqui</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Assim que alguém finalizar uma compra, o pedido aparecerá nesta lista.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {result.data.map((order) => (
        <article key={order.id} className="rounded-3xl border border-primary/10 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-primary/10 pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-bold text-text-title">
                  Pedido #{order.id.slice(-8).toUpperCase()}
                </h2>
                <span className={`rounded-pill px-2.5 py-1 text-[10px] font-black ${statusStyles[order.status]}`}>
                  {statuses.find((item) => item.value === order.status)?.label ?? order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">Recebido em {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-display text-xl font-bold text-primary">{formatCurrency(order.total)}</p>
              <select
                value={order.status}
                onChange={(event) => updateStatus(order, event.target.value as OrderStatus)}
                className="rounded-xl border border-primary/15 bg-white px-3 py-2 text-xs font-bold text-text-title outline-none focus:border-primary"
                aria-label="Atualizar status do pedido"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-2">
              {(order.items ?? []).map((item, index) => (
                <div key={item.id ?? `${item.productId}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text-title">
                      {item.product?.name ?? item.productId}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                      {item.variation ? ` · ${item.variation}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-text-title">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              {order.notes && (
                <p className="mt-3 rounded-xl bg-primary-light/50 p-3 text-xs leading-relaxed text-text-secondary">
                  <strong className="text-text-title">Observações:</strong> {order.notes}
                </p>
              )}
            </div>

            {order.address && (
              <div className="rounded-2xl bg-primary-light/50 p-4 text-xs leading-relaxed text-text-secondary">
                <p className="mb-1 flex items-center gap-2 font-black text-text-title">
                  <PackageCheck size={15} /> Endereço de entrega
                </p>
                <p>{order.address.street}, {order.address.number}</p>
                {order.address.complement && <p>{order.address.complement}</p>}
                <p>{order.address.district} · {order.address.city} - {order.address.state}</p>
                <p>CEP {order.address.zipCode}</p>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
