import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
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
          <h1 className="font-display text-4xl font-bold text-text-title">Comece sua loja hoje</h1>
          <p className="mt-3 leading-relaxed text-text-secondary">
            Crie sua conta, personalize sua vitrine e publique os primeiros produtos.
          </p>
          <RegisterForm />
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-white/10" />
        <div className="relative flex h-full flex-col justify-center px-16 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Comece em minutos</p>
          <div className="mt-8 space-y-5">
            {["Crie sua conta de lojista", "Monte sua vitrine e identidade", "Publique produtos e venda"].map(
              (step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 font-black">
                    {index + 1}
                  </span>
                  <span className="font-display text-xl font-bold">{step}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
