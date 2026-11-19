import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { ProductActions } from "@/components/store/product-actions";

interface ProductPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await api.getProduct(id);
    return { title: product.name, description: product.description || undefined };
  } catch {
    return { title: "Produto não encontrado" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, id } = await params;
  let store;
  let product;
  try {
    [store, product] = await Promise.all([api.getStore(slug), api.getProduct(id)]);
  } catch {
    notFound();
  }

  if (product.storeId !== store.id) notFound();

  const images = product.images?.length ? product.images : [];
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#fffafb]">
      <StoreHeader store={store} />
      <main className="container-page py-8 sm:py-12">
        <Link
          href={`/loja/${slug}#produtos`}
          className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} /> Voltar para os produtos
        </Link>

        <div className="grid gap-9 lg:grid-cols-2 lg:gap-14">
          <div className="grid gap-3 sm:grid-cols-2">
            {images.length ? (
              images.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={product.name}
                  className={`aspect-square w-full rounded-card object-cover shadow-card ${
                    images.length === 1 ? "sm:col-span-2" : ""
                  }`}
                />
              ))
            ) : (
              <div className="skeleton aspect-square rounded-card sm:col-span-2" />
            )}
          </div>

          <div className="lg:py-5">
            {product.category && (
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-primary">
                {product.category.name}
              </p>
            )}
            <h1 className="font-display text-4xl font-bold leading-tight text-text-title sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-6">
              {discount > 0 && (
                <p className="text-base text-price-old line-through">
                  {formatCurrency(product.comparePrice as number)}
                </p>
              )}
              <p className="text-3xl font-black text-primary">{formatCurrency(product.price)}</p>
              {product.installments && product.installments > 1 && (
                <p className="mt-1 text-sm text-text-secondary">
                  ou {product.installments}x de {formatCurrency(product.price / product.installments)} sem juros
                </p>
              )}
            </div>

            {product.description && (
              <div className="mt-7 whitespace-pre-line leading-7 text-text-secondary">
                {product.description}
              </div>
            )}

            <ProductActions product={product} storeSlug={slug} />

            <div className="mt-8 grid gap-3 border-t border-primary/10 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-light text-primary">
                  <PackageCheck size={19} />
                </span>
                <div>
                  <p className="text-sm font-bold text-text-title">Entrega segura</p>
                  <p className="text-xs text-text-secondary">Acompanhamento do pedido</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-light text-primary">
                  <ShieldCheck size={19} />
                </span>
                <div>
                  <p className="text-sm font-bold text-text-title">Compra protegida</p>
                  <p className="text-xs text-text-secondary">Pagamento seguro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
