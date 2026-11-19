"use client";

import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/api";

export function ProductCard({ product, storeSlug }: { product: Product; storeSlug: string }) {
  const { addItem } = useCart();
  const hasDiscount = Boolean(product.comparePrice && product.comparePrice > product.price);
  const discount = hasDiscount
    ? Math.round((1 - product.price / (product.comparePrice as number)) * 100)
    : 0;
  const image = product.images?.[0];

  return (
    <article className="card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link
        href={`/loja/${storeSlug}/produto/${product.id}`}
        className="relative block aspect-[4/4.7] overflow-hidden bg-primary-light"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary-light to-accent/30">
            <ShoppingBag size={44} className="text-primary/35" strokeWidth={1.4} />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-pill bg-primary px-3 py-1 text-xs font-black text-white shadow-card">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-x-3 bottom-3 rounded-pill bg-white/95 py-2 text-center text-xs font-black text-text-title shadow-card backdrop-blur">
            Esgotado
          </span>
        )}
      </Link>

      <div className="p-4 sm:p-5">
        {product.category && (
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-primary">
            {product.category.name}
          </p>
        )}
        <Link href={`/loja/${storeSlug}/produto/${product.id}`}>
          <h3 className="font-display text-lg font-bold leading-snug text-text-title transition group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {product.description}
          </p>
        )}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {hasDiscount && (
              <p className="text-xs text-price-old line-through">
                {formatCurrency(product.comparePrice as number)}
              </p>
            )}
            <p className="text-xl font-black text-text-title">
              {formatCurrency(product.price)}
            </p>
            {product.installments && product.installments > 1 && (
              <p className="text-xs text-text-secondary">
                ou {product.installments}x sem juros
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => addItem(product, 1, undefined, storeSlug)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white shadow-card transition hover:scale-105 hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:scale-100"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={21} />
          </button>
        </div>
      </div>
    </article>
  );
}
