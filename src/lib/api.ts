import type {
  AuthResponse,
  Category,
  CreateOrderInput,
  Order,
  Paginated,
  Product,
  Store,
  User,
} from "@/types/api";

export const FALLBACK_API_URL = "https://vendas-black.onrender.com/api/v1";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function isLoopback(url: string): boolean {
  return /\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(url);
}

/**
 * Descobre a URL da API.
 *
 * Protege contra o erro mais comum de deploy: build feito com
 * NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 e site publicado. Nesse
 * caso o navegador do visitante tentaria o próprio localhost e nada
 * funcionaria. Fora de um contexto local, cai na API pública.
 */
function resolveApiUrl(): string {
  if (!configuredApiUrl) return FALLBACK_API_URL;
  if (!isLoopback(configuredApiUrl)) return configuredApiUrl;

  // No servidor (SSR/Server Components) de um build de produção.
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "production"
      ? FALLBACK_API_URL
      : configuredApiUrl;
  }

  // No navegador: só usa localhost se a própria página também for local.
  const pageHost = window.location.hostname;
  const pageIsLocal =
    pageHost === "localhost" ||
    pageHost === "127.0.0.1" ||
    pageHost === "[::1]" ||
    pageHost.endsWith(".localhost");

  return pageIsLocal ? configuredApiUrl : FALLBACK_API_URL;
}

export const API_URL = resolveApiUrl();

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Erro que significa "este usuário ainda não tem loja".
 *
 * 404 = não existe loja para o dono; 403 = o papel atual não é lojista
 * (cliente recém-cadastrado). Nos dois casos o painel deve oferecer a criação
 * da loja em vez de exibir a mensagem crua da API.
 */
export function isMissingStoreError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 403);
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as { message?: string | string[]; error?: string };
  if (Array.isArray(body.message)) return body.message.join(" ");
  return body.message || body.error || fallback;
}

type ApiRequestOptions = RequestInit & { token?: string; baseUrl?: string };

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers, baseUrl = API_URL, ...requestOptions } = options;
  const requestUrl = /^https?:\/\//i.test(path) ? path : `${baseUrl}${path}`;
  let response: Response;
  try {
    response = await fetch(requestUrl, {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        ...(requestOptions.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      cache: requestOptions.cache ?? "no-store",
    });
  } catch (error) {
    console.error(`[api] falha de rede em ${requestUrl}`, error);
    throw new ApiError(
      "Não conseguimos conectar ao servidor. Verifique sua conexão e tente novamente em instantes.",
      0,
      error,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `Erro ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as T;
}

/**
 * Faz uma requisição à própria aplicação Next.js.
 *
 * O proxy interno é usado na autenticação para evitar problemas de CORS e
 * impedir que o navegador tente acessar `localhost` em um site publicado.
 */
export function sameOriginRequest<T>(
  path: string,
  options: Omit<ApiRequestOptions, "baseUrl"> = {},
): Promise<T> {
  return apiRequest<T>(path, { ...options, baseUrl: "" });
}

export const api = {
  getStore: (slug: string) =>
    apiRequest<Store>(`/stores/public/${encodeURIComponent(slug)}`),
  getProducts: (
    slug: string,
    params: { page?: number; limit?: number; category?: string; search?: string } = {},
  ) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query}` : "";
    return apiRequest<Paginated<Product>>(
      `/products/public/${encodeURIComponent(slug)}${suffix}`,
    );
  },
  getCategories: (slug: string) =>
    apiRequest<Category[]>(
      `/products/public/${encodeURIComponent(slug)}/categories`,
    ),
  getProduct: (id: string) => apiRequest<Product>(`/products/${id}`),
  createOrder: (input: CreateOrderInput, token?: string) =>
    apiRequest<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(input),
      token,
    }),
  login: (email: string, password: string) =>
    sameOriginRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    sameOriginRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  me: (token: string) => apiRequest<User>("/auth/me", { token }),
  myStore: (token: string) => apiRequest<Store>("/stores/mine", { token }),
  updateStore: (token: string, data: Partial<Store>) =>
    apiRequest<Store>("/stores/mine", {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  updateTheme: (token: string, data: Partial<NonNullable<Store["theme"]>>) =>
    apiRequest<NonNullable<Store["theme"]>>("/stores/mine/theme", {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),
  createStore: (
    token: string,
    data: { slug: string; name: string; description?: string },
  ) =>
    apiRequest<Store>("/stores", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  getMyProducts: (token: string, page = 1, limit = 20) =>
    apiRequest<Paginated<Product>>(`/products/mine?page=${page}&limit=${limit}`, {
      token,
    }),
  createProduct: (token: string, data: Partial<Product>) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  updateProduct: (token: string, id: string, data: Partial<Product>) =>
    apiRequest<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  deleteProduct: (token: string, id: string) =>
    apiRequest<Product>(`/products/${id}`, { method: "DELETE", token }),
  getStoreProducts: (token: string, params: { page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && String(value) !== "") query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query}` : "";
    return apiRequest<Paginated<Product>>(`/products/mine${suffix}`, { token });
  },
  getStoreCategories: (token: string) =>
    apiRequest<Category[]>(`/products/mine/categories`, { token }),
  createCategory: (token: string, data: { name: string; slug?: string }) =>
    apiRequest<Category>("/products/mine/categories", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  updateCategory: (
    token: string,
    id: string,
    data: { name?: string; slug?: string },
  ) =>
    apiRequest<Category>(`/products/mine/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  deleteCategory: (token: string, id: string) =>
    apiRequest<Category>(`/products/mine/categories/${id}`, {
      method: "DELETE",
      token,
    }),
  uploadImages: (token: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiRequest<{ urls: string[] }>("/uploads/images", {
      method: "POST",
      body: formData,
      token,
    });
  },
  getStoreOrders: (token: string, page = 1, limit = 20) =>
    apiRequest<Paginated<Order>>(`/orders/store?page=${page}&limit=${limit}`, {
      token,
    }),
  updateOrderStatus: (token: string, id: string, status: string) =>
    apiRequest<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),
};
