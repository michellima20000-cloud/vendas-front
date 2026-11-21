"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ExternalLink, LoaderCircle, Save, Store } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, ApiError, isMissingStoreError } from "@/lib/api";
import { slugify } from "@/lib/format";
import type { Store as StoreType } from "@/types/api";

export function StoreManager() {
  const router = useRouter();
  const { token } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .myStore(token)
      .then(setStore)
      .catch((requestError) => {
        if (!isMissingStoreError(requestError)) {
          setError(requestError instanceof Error ? requestError.message : "Erro ao carregar a loja");
        }
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const payload = {
      name,
      slug: slugify(String(form.get("slug"))),
      description: String(form.get("description")),
      about: String(form.get("about")),
      whatsapp: String(form.get("whatsapp")),
      instagram: String(form.get("instagram")),
      couponCode: String(form.get("couponCode")) || undefined,
    };

    try {
      const saved = await (store
        ? api.updateStore(token, payload)
        : api.createStore(token, payload));
      setStore(saved);
      setSuccess(store ? "Loja atualizada com sucesso." : "Loja criada! Agora cadastre seus produtos.");
      if (!store) router.push("/painel/produtos");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Não foi possível salvar a loja.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoaderCircle className="animate-spin text-primary" size={28} />;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700" role="status">
          {success}
        </p>
      )}

      <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-light text-primary">
            <Store size={21} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-text-title">Dados da loja</h2>
            <p className="text-xs text-text-secondary">Essas informações aparecem na sua vitrine.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="field-label">Nome da loja</span>
            <input name="name" required minLength={2} defaultValue={store?.name} className="field" placeholder="Ateliê Bella" />
          </label>
          <label>
            <span className="field-label">Endereço da loja</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">/loja/</span>
              <input name="slug" required defaultValue={store?.slug} className="field !pl-[4.6rem]" placeholder="atelie-bella" pattern="[a-z0-9-]+" />
            </div>
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Descrição curta</span>
            <textarea name="description" defaultValue={store?.description ?? ""} rows={3} maxLength={180} className="field resize-none" placeholder="Conte em poucas linhas o que sua loja oferece." />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Sobre a loja</span>
            <textarea name="about" defaultValue={store?.about ?? ""} rows={6} className="field resize-y" placeholder="Conte a história da sua marca, materiales, processo e diferenciais." />
          </label>
          <label>
            <span className="field-label">WhatsApp</span>
            <input name="whatsapp" defaultValue={store?.whatsapp ?? ""} className="field" placeholder="(11) 99999-9999" />
          </label>
          <label>
            <span className="field-label">Instagram</span>
            <input name="instagram" defaultValue={store?.instagram ?? ""} className="field" placeholder="@ateliebella" />
          </label>
          <label>
            <span className="field-label">Cupom de desconto</span>
            <input name="couponCode" defaultValue={store?.couponCode ?? ""} className="field uppercase" placeholder="PRIMEIRACOMPRA" />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        {store && (
          <a
            href={`/loja/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <ExternalLink size={17} /> Ver minha loja
          </a>
        )}
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
          {isSubmitting ? "Salvando..." : store ? "Salvar alterações" : "Criar minha loja"}
        </button>
      </div>
    </form>
  );
}
