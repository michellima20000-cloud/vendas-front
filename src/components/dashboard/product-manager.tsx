"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  ImagePlus,
  LoaderCircle,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, isMissingStoreError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { ProductFormDialog } from "@/components/dashboard/product-form-dialog";
import type { Paginated, Product } from "@/types/api";

export function ProductManager() {
  const { token } = useAuth();
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [missingStore, setMissingStore] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      setResult(await api.getMyProducts(token, 1, 100));
      setMissingStore(false);
    } catch (requestError) {
      if (isMissingStoreError(requestError)) {
        setMissingStore(true);
      } else {
        setError(requestError instanceof Error ? requestError.message : "Erro ao carregar produtos");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function remove(product: Product) {
    if (!token || !window.confirm(`Remover “${product.name}” do catálogo?`)) return;
    try {
      await api.deleteProduct(token, product.id);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro ao remover produto");
    }
  }

  const products = (result?.data ?? []).filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (missingStore) {
    return (
      <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-primary">
          <Package size={30} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-text-title">
          Você ainda não tem uma loja
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Crie sua loja para cadastrar produtos e começar a vender.
        </p>
        <Link href="/painel/loja" className="btn-primary mt-6">
          Criar minha loja
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <label className="relative w-full max-w-sm">
          <span className="sr-only">Buscar produto</span>
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="field !pl-11"
            placeholder="Buscar produto"
          />
        </label>
        <button type="button" onClick={() => setEditing(null)} className="btn-primary">
          <Plus size={17} /> Novo produto
        </button>
      </div>

      {error && (
        <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <LoaderCircle className="animate-spin text-primary" size={28} />
      ) : products.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-primary">
            <Package size={30} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-text-title">
            {search ? "Nenhum produto encontrado" : "Seu catálogo está vazio"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            {search
              ? "Tente buscar por outro nome."
              : "Cadastre seu primeiro produto para começar a vender."}
          </p>
          {!search && (
            <button type="button" onClick={() => setEditing(null)} className="btn-primary mt-6">
              <Plus size={17} /> Cadastrar produto
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-primary/10 bg-primary-light/40 text-xs uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-5 py-4 font-black">Produto</th>
                  <th className="px-5 py-4 font-black">Preço</th>
                  <th className="px-5 py-4 font-black">Estoque</th>
                  <th className="px-5 py-4 font-black">Status</th>
                  <th className="px-5 py-4 text-right font-black">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {products.map((product) => (
                  <tr key={product.id} className="transition hover:bg-primary-light/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-primary-light">
                          {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-primary/35">
                              <ImagePlus size={19} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-title">{product.name}</p>
                          <p className="mt-0.5 max-w-xs truncate text-xs text-text-secondary">
                            {product.description || "Sem descrição"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-text-title">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4 text-sm text-text-secondary">{product.stock}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-pill px-2.5 py-1 text-[10px] font-black ${
                          product.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(product)}
                          className="grid h-9 w-9 place-items-center rounded-xl text-text-secondary transition hover:bg-primary-light hover:text-primary"
                          aria-label={`Editar ${product.name}`}
                        >
                          <Edit3 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(product)}
                          className="grid h-9 w-9 place-items-center rounded-xl text-text-secondary transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remover ${product.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing !== undefined && (
        <ProductFormDialog
          isOpen
          product={editing}
          onClose={() => setEditing(undefined)}
          onSuccess={load}
        />
      )}
    </>
  );
}
