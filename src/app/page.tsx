import Link from "next/link";
import {
  ArrowRight,
  Heart,
  LayoutDashboard,
  PackageCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { StoreLookup } from "@/components/store/store-lookup";

const benefits = [
  {
    icon: Sparkles,
    title: "Lojas com identidade",
    description: "Cada marca tem seu próprio catálogo, tema e identidade visual.",
  },
  {
    icon: PackageCheck,
    title: "Pedido simples",
    description: "Escolha, finalize e acompanhe tudo em poucos passos.",
  },
  {
    icon: LayoutDashboard,
    title: "Gestão descomplicada",
    description: "Produtos, pedidos e dados da loja em um só painel.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-gradient-to-b from-primary-light via-[#fff7f9] to-transparent" />
        <div className="container-page flex min-h-[46rem] flex-col py-7">
          <header className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="btn-secondary !px-4 !py-2.5">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn-primary !px-4 !py-2.5">
                Criar conta
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-pill border border-primary/15 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary shadow-card backdrop-blur">
              <Heart size={14} fill="currentColor" /> Feito para quem vende com carinho
            </span>
            <h1 className="font-display max-w-4xl text-5xl font-bold leading-[1.04] text-text-title sm:text-6xl lg:text-7xl">
              Sua loja dos sonhos,{" "}
              <span className="text-primary">do seu jeito.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Crie uma vitrine elegante, organize seus produtos e receba pedidos sem perder o essence da sua marca.
            </p>
            <StoreLookup />
            <p className="mt-4 text-xs text-text-secondary">
              Ej.: <Link href="/loja/atelie-bella" className="font-bold text-primary hover:underline">atelie-bella</Link>
            </p>
          </div>

          <div className="grid gap-4 border-t border-primary/10 py-8 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 rounded-2xl p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary">
                  <Icon size={21} />
                </span>
                <div>
                  <h2 className="font-display font-bold text-text-title">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid items-center gap-12 rounded-[2.5rem] bg-primary p-8 text-white shadow-card-hover sm:p-12 lg:grid-cols-2 lg:p-16">
          <div>
            <span className="inline-flex rounded-pill bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider">
              Para lojistas
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Mais tempo para vender. Menos tempo com burocracia.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-white/80">
              Cadastre produtos, acompanhe pedidos e mantenha sua loja sempre atualizada, mesmo quando estiver pelo celular.
            </p>
            <Link href="/cadastro" className="mt-8 inline-flex items-center gap-2 rounded-pill bg-white px-6 py-3 text-sm font-black text-primary transition hover:-translate-y-0.5">
              Começar agora <ArrowRight size={17} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <Store size={28} />
              <p className="mt-8 font-display text-3xl font-bold">100%</p>
              <p className="text-sm text-white/70">sua identidade</p>
            </div>
            <div className="mt-8 rounded-3xl bg-white/10 p-6 backdrop-blur">
              <PackageCheck size={28} />
              <p className="mt-8 font-display text-3xl font-bold">24h</p>
              <p className="text-sm text-white/70">para começar</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-primary/10 bg-white py-8">
        <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-text-secondary sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Vendas Black. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
