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

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";

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

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as { message?: string | string[]; error?: string };
  if (Array.isArray(body.message)) return body.message.join(" ");
  return body.message || body.error || fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
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
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/register", {
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
