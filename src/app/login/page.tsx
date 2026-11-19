import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary">
            <ArrowLeft size={16} /> Início
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-md py-14">
          <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary-light text-primary">
            <Sparkles size={23} />
          </span>
          <h1 className="font-display text-4xl font-bold text-text-title">Que bom ter você de volta</h1>
          <p className="mt-3 leading-relaxed text-text-secondary">
            Entre para acompanhar sua loja, produtos e pedidos.
          </p>
          <LoginForm />
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/10" />
        <div className="relative flex h-full flex-col justify-center px-16 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Vendas Black</p>
          <blockquote className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight">
            “Sua marca merece uma vitrine tão bonita quanto seus produtos.”
          </blockquote>
          <p className="mt-5 text-white/65">Simples de gerenciar. Bonito de vender.</p>
        </div>
      </section>
    </main>
  );
}
