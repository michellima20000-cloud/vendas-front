"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      router.push("/painel");
      router.refresh();
    } catch (requestError) {
      console.error("[auth] falha ao entrar", requestError);
      setError(
        requestError instanceof ApiError || requestError instanceof Error
          ? requestError.message
          : "Não foi possível entrar. Verifique sua conexão.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {error}
        </p>
      )}
      <label>
        <span className="field-label">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="voce@email.com"
        />
      </label>
      <label>
        <span className="field-label">Senha</span>
        <span className="relative block">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="field pr-12"
            placeholder="Sua senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </span>
      </label>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
      <p className="text-center text-sm text-text-secondary">
        Ainda não tem uma conta?{" "}
        <Link href="/cadastro" className="font-bold text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
