import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CreditCard,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { whatsappUrl } from "@/lib/format";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { ProductCard } from "@/components/store/product-card";

interface StorePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

const stepIcons = {
  ShoppingBag,
  MessageCircle,
  CreditCard,
  Package,
};

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const store = await api.getStore(slug);
    return {
      title: store.name,
      description: store.description || `Conheça a loja ${store.name}.`,
    };
  } catch {
    return { title: "Loja não encontrada" };
  }
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { slug } = await params;
  const filters = await searchParams;
  const page = Math.max(Number(filters.page) || 1, 1);

  let store;
  try {
    store = await api.getStore(slug);
  } catch {
    notFound();
  }

  const productResult = await api.getProducts(slug, {
    page,
    limit: 12,
    category: filters.category,
    search: filters.search,
  });
  const categories = store.categories ?? (await api.getCategories(slug));
  const theme = store.theme;
  const style = theme
    ? {
        "--store-primary": theme.primaryColor,
        "--store-accent": theme.accentColor,
        "--store-bg": theme.bgColor,
      } as React.CSSProperties
    : undefined;

  return (
    <div style={style} className="min-h-screen bg-[var(--store-bg,#fffafb)]">
      <StoreHeader store={store} />

      <main>
        <section className="relative overflow-hidden border-b border-primary/10">
          {store.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-[#fff7f9] to-accent/25" />
          )}
          <div className={`absolute inset-0 ${store.bannerUrl ? "bg-black/35" : ""}`} />
          <div className="container-page relative flex min-h-[29rem] items-center py-16">
            <div className="max-w-3xl text-white">
              <span className="mb-5 inline-flex items-center gap-2 rounded-pill bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] backdrop-blur">
                <Sparkles size={14} /> Novidades da loja
              </span>
              <h1 className="font-display text-5xl font-bold leading-tight drop-shadow-sm sm:text-6xl">
                {store.name}
              </h1>
              {store.description && (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
                  {store.description}
                </p>
              )}
              <a href="#produtos" className="btn-primary mt-8 !bg-white !text-primary hover:!bg-primary-light">
                Ver produtos
              </a>
            </div>
          </div>
        </section>

        <section id="produtos" className="container-page scroll-mt-24 py-16">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                Nosso catálogo
              </p>
              <h2 className="section-title">Produtos em destaque</h2>
              <p className="mt-3 text-text-secondary">
                {productResult.total} {productResult.total === 1 ? "produto encontrado" : "produtos encontrados"}
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2" method="get">
              {filters.category && (
                <input type="hidden" name="category" value={filters.category} />
              )}
              <label className="relative flex-1">
                <span className="sr-only">Buscar produtos</span>
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  name="search"
                  defaultValue={filters.search}
                  className="field !pl-11"
                  placeholder="Buscar no catálogo"
                />
              </label>
              <button type="submit" className="btn-primary !px-4">
                Buscar
              </button>
            </form>
          </div>

          {categories.length > 0 && (
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              <a
                href={`/loja/${slug}${filters.search ? `?search=${encodeURIComponent(filters.search)}` : ""}`}
                className={`shrink-0 rounded-pill px-5 py-2.5 text-sm font-bold transition ${
                  !filters.category
                    ? "bg-primary text-white shadow-card"
                    : "bg-white text-text-secondary hover:bg-primary-light hover:text-primary"
                }`}
              >
                Todos
              </a>
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/loja/${slug}?category=${category.slug}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ""}`}
                  className={`shrink-0 rounded-pill px-5 py-2.5 text-sm font-bold transition ${
                    filters.category === category.slug
                      ? "bg-primary text-white shadow-card"
                      : "bg-white text-text-secondary hover:bg-primary-light hover:text-primary"
                  }`}
                >
                  {category.name}
                </a>
              ))}
            </div>
          )}

          {productResult.data.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productResult.data.map((product) => (
                <ProductCard key={product.id} product={product} storeSlug={slug} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[2rem] border border-dashed border-primary/20 bg-white/60 px-6 py-16 text-center">
              <ShoppingBag size={38} className="mx-auto text-primary/40" />
              <h3 className="mt-4 font-display text-xl font-bold text-text-title">
                Nenhum produto encontrado
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                Tente outro termo ou remova os filtros aplicados.
              </p>
              <a href={`/loja/${slug}`} className="btn-secondary mt-6">
                Limpar filtros
              </a>
            </div>
          )}

          {productResult.pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: productResult.pages }, (_, index) => index + 1).map(
                (number) => (
                  <a
                    key={number}
                    href={`/loja/${slug}?page=${number}${filters.category ? `&category=${filters.category}` : ""}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ""}`}
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black ${
                      number === page
                        ? "bg-primary text-white"
                        : "bg-white text-text-secondary hover:bg-primary-light"
                    }`}
                  >
                    {number}
                  </a>
                ),
              )}
            </div>
          )}
        </section>

        {store.howToBuy && store.howToBuy.length > 0 && (
          <section id="como-comprar" className="scroll-mt-24 bg-white py-16">
            <div className="container-page">
              <div className="mx-auto max-w-2xl text-center">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  Simples do início ao fim
                </p>
                <h2 className="section-title">Como comprar</h2>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {store.howToBuy.map((step) => {
                  const Icon = stepIcons[step.icon as keyof typeof stepIcons] ?? ShoppingBag;
                  return (
                    <div key={step.id} className="relative rounded-card bg-primary-light/60 p-6 text-center">
                      <span className="absolute right-4 top-3 font-display text-4xl font-bold text-primary/15">
                        {step.step}
                      </span>
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-primary shadow-card">
                        <Icon size={25} />
                      </span>
                      <h3 className="mt-5 font-display text-lg font-bold text-text-title">{step.title}</h3>
                      <p className="mt-2 text-sm text-text-secondary">{step.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {store.about && (
          <section id="sobre" className="scroll-mt-24 container-page py-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-primary">Nossa história</p>
              <h2 className="section-title">Sobre {store.name}</h2>
              <p className="mt-6 whitespace-pre-line text-base leading-8 text-text-secondary">{store.about}</p>
            </div>
          </section>
        )}

        {store.whatsapp && (
          <section className="container-page pb-16">
            <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-primary px-7 py-9 text-center text-white shadow-card-hover sm:flex-row sm:text-left">
              <div>
                <h2 className="font-display text-2xl font-bold">Ainda ficou com alguma dúvida?</h2>
                <p className="mt-2 text-sm text-white/75">Chame a loja e receba atendimento personalizado.</p>
              </div>
              <a
                href={whatsappUrl(store.whatsapp, `Olá! Preciso de ajuda com a ${store.name}.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-white px-6 py-3 text-sm font-black text-primary transition hover:-translate-y-0.5"
              >
                <MessageCircle size={18} /> Falar no WhatsApp
              </a>
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
