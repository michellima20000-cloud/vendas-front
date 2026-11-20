import "server-only";
import { NextResponse } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import type { AuthResponse } from "@/types/api";

type AuthAction = "login" | "register";

interface AuthPayload {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

function isValidPayload(action: AuthAction, payload: AuthPayload): boolean {
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  if (!email || email.length > 254 || !password || password.length < 6 || password.length > 128) {
    return false;
  }

  return action === "login" || (name.length >= 2 && name.length <= 120);
}

/**
 * Encaminha login/cadastro pela mesma origem do front-end.
 *
 * Isso elimina erros de CORS e também impede que um bundle publicado tente
 * chamar `http://localhost:3001` no navegador de quem está usando a loja.
 */
export async function proxyAuthRequest(
  request: Request,
  action: AuthAction,
): Promise<NextResponse> {
  let payload: AuthPayload;

  try {
    payload = (await request.json()) as AuthPayload;
  } catch {
    return NextResponse.json(
      { message: "Os dados de acesso enviados são inválidos." },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object" || !isValidPayload(action, payload)) {
    return NextResponse.json(
      { message: "Informe um e-mail válido e uma senha com pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  try {
    const response = await apiRequest<AuthResponse>(`/auth/${action}`, {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status >= 400 && error.status <= 599 ? error.status : 502;
      const message =
        status >= 500
          ? "O servidor de autenticação está indisponível. Tente novamente em instantes."
          : error.message;

      return NextResponse.json({ message }, { status });
    }

    console.error(`[auth-proxy] falha inesperada no ${action}`, error);
    return NextResponse.json(
      { message: "Não foi possível autenticar agora. Tente novamente em instantes." },
      { status: 502 },
    );
  }
}
