"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Check, LoaderCircle, Palette, Save, Store } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, isMissingStoreError } from "@/lib/api";
import {
  BODY_FONTS,
  TITLE_FONTS,
  fontStack,
  googleFontsHref,
  withCurrentFont,
} from "@/lib/fonts";

export function ThemeEditor() {
  const { token } = useAuth();
  const [theme, setTheme] = useState({
    primaryColor: "#B07A85",
    accentColor: "#F4A3BA",
    bgColor: "#FFF1F5",
    fontTitle: "Playfair Display",
    fontBody: "Nunito",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStore, setHasStore] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .myStore(token)
      .then((store) => {
        if (store.theme) {
          setTheme({
            primaryColor: store.theme.primaryColor,
            accentColor: store.theme.accentColor,
            bgColor: store.theme.bgColor,
            fontTitle: store.theme.fontTitle,
            fontBody: store.theme.fontBody,
          });
        }
        setHasStore(true);
      })
      .catch((requestError) => {
        if (isMissingStoreError(requestError)) {
          setHasStore(false);
        } else {
          setError(requestError instanceof Error ? requestError.message : "Erro ao carregar o tema");
        }
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      primaryColor: String(form.get("primaryColor")),
      accentColor: String(form.get("accentColor")),
      bgColor: String(form.get("bgColor")),
      fontTitle: String(form.get("fontTitle")),
      fontBody: String(form.get("fontBody")),
    };

    try {
      await api.updateTheme(token, payload);
      setTheme(payload);
      setMessage("Tema atualizado com sucesso.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o tema.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoaderCircle className="animate-spin text-primary" size={28} />;

  if (!hasStore) {
    return (
      <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-primary">
          <Store size={30} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-text-title">
          Crie sua loja para personalizar o tema
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
          As cores e as fontes ficam disponíveis assim que a sua vitrine existir.
        </p>
        <Link href="/painel/loja" className="btn-primary mt-6">
          Criar minha loja
        </Link>
      </div>
    );
  }

  const titleOptions = withCurrentFont(TITLE_FONTS, theme.fontTitle);
  const bodyOptions = withCurrentFont(BODY_FONTS, theme.fontBody);
  const previewFontsHref = googleFontsHref([theme.fontTitle, theme.fontBody]);

  return (
    <form onSubmit={submit} className="space-y-6">
      {previewFontsHref && <link rel="stylesheet" href={previewFontsHref} />}
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {message && (
        <p className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          <Check size={16} /> {message}
        </p>
      )}

      <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-light text-primary">
            <Palette size={21} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-text-title">Cores e tipografia</h2>
            <p className="text-xs text-text-secondary">Deixe a vitrine com a identidade da sua marca.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <ColorField name="primaryColor" label="Cor principal" value={theme.primaryColor} />
          <ColorField name="accentColor" label="Cor de destaque" value={theme.accentColor} />
          <ColorField name="bgColor" label="Cor de fundo" value={theme.bgColor} />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="field-label">Fonte dos títulos</span>
            <select
              name="fontTitle"
              required
              defaultValue={theme.fontTitle}
              className="field"
              onChange={(event) =>
                setTheme((current) => ({ ...current, fontTitle: event.target.value }))
              }
            >
              {titleOptions.map((option) => (
                <option key={option.family} value={option.family}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Fonte do corpo</span>
            <select
              name="fontBody"
              required
              defaultValue={theme.fontBody}
              className="field"
              onChange={(event) =>
                setTheme((current) => ({ ...current, fontBody: event.target.value }))
              }
            >
              {bodyOptions.map((option) => (
                <option key={option.family} value={option.family}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-text-title">Pré-visualização</h2>
        <div
          className="mt-5 rounded-[2rem] p-7"
          style={{ backgroundColor: theme.bgColor, color: theme.primaryColor }}
        >
          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">Sua loja</p>
          <h3
            className="mt-2 text-3xl font-bold"
            style={{ fontFamily: fontStack(theme.fontTitle, "Georgia, serif") }}
          >
            Título em destaque
          </h3>
          <p
            className="mt-3 max-w-md text-sm opacity-75"
            style={{ fontFamily: fontStack(theme.fontBody, '"Segoe UI", Arial, sans-serif') }}
          >
            Así fica a combinação de cores e fontes aplicada à sua vitrine.
          </p>
          <button
            type="button"
            className="mt-5 rounded-pill px-5 py-2.5 text-sm font-black text-white"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Botão principal
          </button>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
          {isSubmitting ? "Salvando..." : "Salvar tema"}
        </button>
      </div>
    </form>
  );
}

function ColorField({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-white p-2">
        <input name={name} type="color" defaultValue={value} className="h-10 w-12 cursor-pointer rounded-xl border-0 bg-transparent p-0" />
        <span className="text-sm font-bold uppercase text-text-secondary">{value}</span>
      </span>
    </label>
  );
}
