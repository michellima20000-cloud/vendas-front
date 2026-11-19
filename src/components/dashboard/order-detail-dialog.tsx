"use client";

import { X, Truck, CheckCircle, Clock, XCircle, Package2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/api";

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
}

const statusIcons: Record<OrderStatus, typeof Clock> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPED: Truck,
  DELIVERED: Package2,
  CANCELLED: XCircle,
};

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
};

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
  if (!order) return null;

  const Icon = statusIcons[order.status] || Clock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/35 backdrop-blur p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-primary/10 bg-white/95 backdrop-blur px-5 py-4 rounded-t-2xl">
          <div>
            <p className="font-display text-lg font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-text-secondary">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary hover:bg-primary-light hover:text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="rounded-xl border border-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${statusStyles[order.status]}`}>
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-bold text-text-title">{statusLabels[order.status]}</p>
                  <p className="text-xs text-text-secondary">
                    {order.paymentMethod ? paymentLabels[order.paymentMethod] : "Pagamento não informado"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-black text-primary">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <section>
              <h3 className="mb-3 font-bold text-text-title">Itens do pedido</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id || item.productId} className="flex gap-3 rounded-xl border border-primary/10 p-3">
                    {item.product?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary-light text-primary">
                        <Package2 size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-title truncate">{item.product?.name || "Produto"}</p>
                      {item.variation && <p className="text-xs text-text-secondary">{item.variation}</p>}
                      <p className="mt-1 text-sm font-bold text-text-title">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-text-secondary">Qtd: {item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-bold text-text-title">Endereço de entrega</h3>
              {order.address ? (
                <div className="rounded-xl border border-primary/10 p-4">
                  <p className="font-bold text-text-title">{order.address.street}, {order.address.number}</p>
                  {order.address.complement && <p className="text-sm text-text-secondary">{order.address.complement}</p>}
                  <p className="text-sm text-text-secondary">{order.address.district}</p>
                  <p className="text-sm text-text-secondary">{order.address.city} - {order.address.state}</p>
                  <p className="text-sm text-text-secondary">{order.address.zipCode}</p>
                </div>
              ) : (
                <p className="text-text-secondary">Endereço não informado</p>
              )}
            </section>
          </div>

          {order.notes && (
            <section>
              <h3 className="mb-3 font-bold text-text-title">Observações</h3>
              <p className="whitespace-pre-line text-text-secondary">{order.notes}</p>
            </section>
          )}

          <div className="rounded-xl border border-primary/10 p-4">
            <h3 className="mb-3 font-bold text-text-title">Resumo financeiro</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                <span className="font-bold text-text-title">{formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span className="font-bold">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-primary/10 pt-2 flex justify-between">
                <span className="font-display font-bold text-text-title">Total</span>
                <span className="font-display text-lg font-black text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-primary/10">
            <button onClick={onClose} className="btn-primary">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}