"use client";

import Link from "next/link";
import { Menu, MessageCircle, ShoppingBag, UserRound } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/cn";
import { whatsappUrl } from "@/lib/format";
import type { Store } from "@/types/api";

export function StoreHeader({ store }: { store: Store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();

  const links = [
    { href: "#produtos", label: "Produtos" },
    { href: "#como-comprar", label: "Como comprar" },
    { href: "#sobre", label: "Sobre" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Link href={`/loja/${store.slug}`} className="flex min-w-0 items-center gap-3">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={`Logo ${store.name}`}
              className="h-11 w-11 rounded-2xl object-cover"
            />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-light font-display text-lg font-bold text-primary">
              {store.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden font-display text-xl font-bold text-text-title sm:block">
            {store.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-text-secondary transition hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {store.whatsapp && (
            <a
              href={whatsappUrl(store.whatsapp, `Olá! Vim pelo site da ${store.name}.`)}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 w-10 place-items-center rounded-full text-whatsapp transition hover:bg-green-50 sm:grid"
              aria-label="Falar no WhatsApp"
            >
              <MessageCircle size={21} />
            </a>
          )}
          <Link
            href="/painel"
            className="hidden h-10 w-10 place-items-center rounded-full text-text-secondary transition hover:bg-primary-light hover:text-primary sm:grid"
            aria-label="Área do lojista"
          >
            <UserRound size={20} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-full text-text-title transition hover:bg-primary-light hover:text-primary"
            aria-label={`Abrir carrinho com ${count} itens`}
          >
            <ShoppingBag size={21} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-full text-text-title hover:bg-primary-light md:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-primary/10 bg-white transition-all md:hidden",
          menuOpen ? "max-h-56" : "max-h-0 border-t-0",
        )}
      >
        <nav className="container-page flex flex-col gap-1 py-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-bold text-text-secondary hover:bg-primary-light hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/painel"
            className="rounded-xl px-3 py-2 text-sm font-bold text-text-secondary hover:bg-primary-light hover:text-primary"
          >
            Área do lojista
          </Link>
        </nav>
      </div>
    </header>
  );
}
