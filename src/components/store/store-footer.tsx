import Link from "next/link";
import { MessageSquare, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { whatsappUrl } from "@/lib/format";
import type { Store } from "@/types/api";

export function StoreFooter({ store }: { store: Store }) {
  return (
    <footer className="mt-20 border-t border-primary/10 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            {store.description || `Conheça ${store.name} e encontre seus próximos favoritos.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {store.instagram && (
            <a
              href={`https://instagram.com/${store.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full border border-primary/15 text-primary transition hover:bg-primary-light"
              aria-label="Instagram da loja"
            >
              <MessageSquare size={19} />
            </a>
          )}
          {store.whatsapp && (
            <a
              href={whatsappUrl(store.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full border border-primary/15 text-whatsapp transition hover:bg-green-50"
              aria-label="WhatsApp da loja"
            >
              <MessageCircle size={20} />
            </a>
          )}
          <Link href="/painel" className="ml-2 text-sm font-bold text-primary hover:underline">
            Sou lojista
          </Link>
        </div>
      </div>
      <div className="border-t border-primary/10 py-4 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} {store.name}. Powered by Vendas Black.
      </div>
    </footer>
  );
}
