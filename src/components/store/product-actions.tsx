"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/api";

export function ProductActions({ product, storeSlug }: { product: Product; storeSlug: string }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [variation, setVariation] = useState<string | undefined>(undefined);
  const [added, setAdded] = useState(false);

  const grouped = (product.variations ?? []).reduce<Record<string, string[]>>(
    (result, item) => {
      result[item.type] = [...(result[item.type] ?? []), item.value];
      return result;
    },
    {},
  );

  function addToCart() {
    addItem(product, quantity, variation, storeSlug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mt-8">
      {Object.entries(grouped).map(([type, values]) => (
        <fieldset key={type} className="mb-6">
          <legend className="field-label capitalize">{type}</legend>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setVariation(value)}
                className={`rounded-pill border px-4 py-2.5 text-sm font-bold transition ${
                  variation === value
                    ? "border-primary bg-primary-light text-primary"
                    : "border-primary/15 text-text-secondary hover:border-primary/40"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-pill border border-primary/15 bg-white p-1">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary-light"
            aria-label="Diminuir quantidade"
          >
            <Minus size={16} />
          </button>
          <span className="w-9 text-center text-sm font-black">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary-light"
            aria-label="Aumentar quantidade"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          disabled={product.stock === 0}
          className="btn-primary flex-1"
        >
          {added ? (
            <>
              <Check size={18} /> Adicionado
            </>
          ) : (
            <>
              <ShoppingBag size={18} /> {product.stock === 0 ? "Sem estoque" : "Adicionar ao carrinho"}
            </>
          )}
        </button>
      </div>

      {product.installments && product.installments > 1 && (
        <p className="mt-3 text-center text-xs text-text-secondary">
          Em até {product.installments}x de {formatCurrency(product.price / product.installments)} sem juros
        </p>
      )}
    </div>
  );
}
