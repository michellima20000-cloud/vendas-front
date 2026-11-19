"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tags,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/cn";

const navigation = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/produtos", label: "Produtos", icon: Package },
  { href: "/painel/categorias", label: "Categorias", icon: Tags },
  { href: "/painel/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/painel/configuracoes", label: "Configurações", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) router.replace("/login");
  }, [isLoading, router, token]);

  if (isLoading || !token) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffafb]">
        <LoaderCircle className="animate-spin text-primary" size={30} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f6f7] lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] border-r border-primary/10 bg-white p-5 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-bold text-text-secondary lg:hidden"
          >
            Fechar
          </button>
        </div>

        <div className="mt-8 rounded-2xl bg-primary-light p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Conta</p>
          <p className="mt-1 truncate font-display font-bold text-text-title">{user?.name}</p>
          <p className="truncate text-xs text-text-secondary">{user?.email}</p>
        </div>

        <nav className="mt-6 space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === "/painel" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                  active
                    ? "bg-primary text-white shadow-card"
                    : "text-text-secondary hover:bg-primary-light hover:text-primary",
                )}
              >
                <Icon size={19} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-5 bottom-5 space-y-2">
          <Link
            href="/painel/loja"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-text-secondary transition hover:bg-primary-light hover:text-primary"
          >
            <Store size={19} /> Minha loja
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-text-secondary transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} /> Sair
          </button>
        </div>
      </aside>

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-primary/10 bg-white/90 px-5 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-primary/15 px-3 py-2 text-sm font-bold lg:hidden"
          >
            Menu
          </button>
          <div className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Painel do lojista</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary">
            Ver site <ExternalLink size={16} />
          </Link>
        </header>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
