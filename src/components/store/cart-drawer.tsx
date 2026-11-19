"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { PaymentMethod } from "@/types/api";

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "PIX", label: "PIX" },
  { value: "CREDIT_CARD", label: "Cartão" },
  { value: "BOLETO", label: "Boleto" },
];

export function CartDrawer() {
  const {
    items,
    count,
    total,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [coupon, setCoupon] = useState("");

  if (!isOpen) return null;

  const storeSlug = items[0]?.storeSlug;

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storeSlug || items.length === 0) return;

    setIsSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const address = {
      street: String(form.get("street") || ""),
      number: String(form.get("number") || ""),
      complement: String(form.get("complement") || ""),
      district: String(form.get("district") || ""),
      city: String(form.get("city") || ""),
      state: String(form.get("state") || ""),
      zipCode: String(form.get("zipCode") || ""),
    };
    const notes = String(form.get("notes") || "");

    try {
      const order = await api.createOrder({
        storeSlug,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          variation: item.variation,
        })),
        paymentMethod,
        address,
        notes,
        couponCode: coupon.trim() || undefined,
      });
      setOrderId(order.id);
      setOrderTotal(order.total);
      clearCart();
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível finalizar o pedido. Tente novamente.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function closePanel() {
    closeCart();
    window.setTimeout(() => {
      setCheckoutOpen(false);
      setOrderId("");
      setOrderTotal(null);
      setCoupon("");
      setError("");
    }, 200);
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrinho">
      <button
        type="button"
        aria-label="Fechar carrinho"
        onClick={closePanel}
        className="absolute inset-0 bg-text-title/35 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <div>
            <p className="font-display text-xl font-bold text-text-title">Seu carrinho</p>
            <p className="text-xs text-text-secondary">{count} {count === 1 ? "item" : "itens"}</p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className="grid h-10 w-10 place-items-center rounded-full text-text-secondary hover:bg-primary-light hover:text-primary"
            aria-label="Fechar"
          >
            <X size={21} />
          </button>
        </div>

        {orderId ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-green-50 text-green-600">
              <PackageCheck size={38} />
            </span>
            <h2 className="mt-6 font-display text-2xl font-bold text-text-title">
              Pedido confirmado!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Seu pedido <strong className="text-text-title">#{orderId.slice(-8).toUpperCase()}</strong> foi registrado. A loja já pode acompanhar o pedido.
            </p>
            {orderTotal !== null && (
              <p className="mt-3 font-display text-xl font-bold text-primary">
                Total: {formatCurrency(orderTotal)}
              </p>
            )}
            <button type="button" onClick={closePanel} className="btn-primary mt-7 w-full">
              Continuar comprando
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-primary-light text-primary">
              <ShoppingBag size={34} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-text-title">
              Seu carrinho está vazio
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Explore os produtos e encontre algo que você ama.
            </p>
            <button type="button" onClick={closePanel} className="btn-primary mt-7 w-full">
              Ver produtos
            </button>
          </div>
        ) : !checkoutOpen ? (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3 border-b border-primary/10 pb-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary-light">
                    {item.product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-primary/40">
                        <ShoppingBag size={26} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display font-bold leading-tight text-text-title">
                        {item.product.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-text-secondary transition hover:text-red-500"
                        aria-label={`Remover ${item.product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.variation && (
                      <p className="mt-1 text-xs text-text-secondary">{item.variation}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-pill border border-primary/15 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary-light"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-black">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary-light"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-black text-text-title">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-primary/10 bg-white p-5">
              <div className="mb-1 flex items-center justify-between text-sm text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-xl font-bold text-text-title">Total</span>
                <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(true)}
                className="btn-primary w-full"
              >
                Finalizar pedido
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submitOrder} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="mb-4 text-sm font-bold text-primary hover:underline"
                >
                  ← Voltar ao carrinho
                </button>
                <h2 className="font-display text-2xl font-bold text-text-title">Finalizar pedido</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Preencha os dados para receber seu pedido.
                </p>
              </div>

              {error && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
                  {error}
                </p>
              )}

              <fieldset>
                <legend className="field-label">Forma de pagamento</legend>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-xs font-bold transition ${
                        paymentMethod === method.value
                          ? "border-primary bg-primary-light text-primary"
                          : "border-primary/15 text-text-secondary hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="sr-only"
                      />
                      {method.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-[1fr_110px] gap-3">
                <label>
                  <span className="field-label">Rua / Avenida</span>
                  <input name="street" required className="field" placeholder="Rua das Flores" />
                </label>
                <label>
                  <span className="field-label">Número</span>
                  <input name="number" required className="field" placeholder="123" />
                </label>
              </div>
              <label>
                <span className="field-label">Complemento (opcional)</span>
                <input name="complement" className="field" placeholder="Apto, bloco..." />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="field-label">Bairro</span>
                  <input name="district" required className="field" placeholder="Centro" />
                </label>
                <label>
                  <span className="field-label">Cidade</span>
                  <input name="city" required className="field" placeholder="São Paulo" />
                </label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <label>
                  <span className="field-label">UF</span>
                  <input name="state" required maxLength={2} className="field uppercase" placeholder="SP" />
                </label>
                <label>
                  <span className="field-label">CEP</span>
                  <input name="zipCode" required className="field" placeholder="00000-000" />
                </label>
              </div>
              <label>
                <span className="field-label">Cupom de desconto (opcional)</span>
                <input
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  className="field uppercase"
                  placeholder="PRIMEIRACOMPRA"
                />
                <span className="mt-1.5 block text-xs text-text-secondary">
                  O desconto é calculado ao confirmar o pedido.
                </span>
              </label>
              <label>
                <span className="field-label">Observações (opcional)</span>
                <textarea name="notes" rows={3} className="field resize-none" placeholder="Horário preferencial, ponto de referência..." />
              </label>
            </div>

            <div className="border-t border-primary/10 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg font-bold">Total</span>
                <span className="text-lg font-black text-primary">{formatCurrency(total)}</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-text-secondary">
                <CheckCircle2 size={13} /> Pedido seguro processado pela loja
              </p>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
