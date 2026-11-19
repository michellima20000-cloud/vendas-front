"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsSubmitting(false);
      return;
    }

    try {
      await register(name, email, password);
      router.push("/painel/loja");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível criar sua conta. Tente novamente.",
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
        <span className="field-label">Seu nome</span>
        <input
          name="name"
          required
          minLength={2}
          autoComplete="name"
          className="field"
          placeholder="Como podemos te chamar?"
        />
      </label>
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
            minLength={6}
            autoComplete="new-password"
            className="field pr-12"
            placeholder="Mínimo de 6 caracteres"
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
        {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <UserPlus size={18} />}
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </button>
      <p className="text-center text-sm text-text-secondary">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Entre agora
        </Link>
      </p>
    </form>
  );
}
