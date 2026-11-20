import "server-only";

import { createHash } from "node:crypto";
import type { Category, Paginated, Product, Store } from "@/types/api";
import { api } from "@/lib/api";
import { redis } from "@/lib/redis";

/**
 * Cache de leitura do catálogo público.
 *
 * O Redis funciona como cache de aplicação (read-through): a primeira visita
 * busca na API e grava; as seguintes leem do Redis até o TTL expirar.
 *
 * Regras importantes deste módulo:
 * - Só roda no servidor (Server Components/Route Handlers). Não importe em
 *   componente "use client": o token ficaria exposto no browser.
 * - Se o Redis estiver sem env, fora do ar ou lento, a função cai direto na
 *   API — o site continua funcionando, só sem cache.
 * - Erros da API (ex.: 404 de loja inexistente) NÃO são cacheados, para que
 *   uma loja criada agora apareça na hora.
 */

const KEY_PREFIX = "vendas:web:v1";

/** Tempo de vida do cache em segundos. */
const TTL = {
  store: 60,
  products: 60,
  categories: 300,
  product: 60,
} as const;

/** Tempo máximo esperando o Redis antes de desistir e ir na API. */
const REDIS_TIMEOUT_MS = 1500;

/**
 * Circuit breaker em memória: depois de uma falha, ignora o Redis por 30s.
 * Evita pagar o timeout em toda requisição enquanto o Redis está fora.
 * Cada instância do servidor aprende sozinha.
 */
const REDIS_COOLDOWN_MS = 30_000;
let skipRedisUntil = 0;

/**
 * Coalesce requisições simultâneas para a mesma chave. Isso evita várias
 * chamadas à API quando a página e os metadados são renderizados juntos.
 */
const inFlight = new Map<string, Promise<unknown>>();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("redis timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Adiciona até 10% de jitter para não expirar muitas chaves ao mesmo tempo. */
function ttlWithJitter(baseTtl: number): number {
  const jitter = 0.9 + Math.random() * 0.2;
  return Math.max(1, Math.round(baseTtl * jitter));
}

function warn(action: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[catalog] Redis ${action} falhou, usando a API: ${message}`);
}

function redisUsable(): boolean {
  return redis !== null && Date.now() >= skipRedisUntil;
}

function tripBreaker() {
  skipRedisUntil = Date.now() + REDIS_COOLDOWN_MS;
}

async function readThroughInternal<T>(
  key: string,
  ttl: number,
  load: () => Promise<T>,
): Promise<T> {
  const client = redis;
  if (!client || !redisUsable()) return load();

  try {
    const cached = await withTimeout(client.get<T>(key), REDIS_TIMEOUT_MS);
    if (cached !== null && cached !== undefined) return cached;
  } catch (error) {
    warn("GET", error);
    tripBreaker();
    return load();
  }

  const value = await load();

  try {
    await withTimeout(
      client.set(key, value, { ex: ttlWithJitter(ttl) }),
      REDIS_TIMEOUT_MS,
    );
  } catch (error) {
    warn("SET", error);
    tripBreaker();
  }

  return value;
}

async function readThrough<T>(
  key: string,
  ttl: number,
  load: () => Promise<T>,
): Promise<T> {
  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const request = readThroughInternal(key, ttl, load);
  inFlight.set(key, request);

  try {
    return await request;
  } finally {
    if (inFlight.get(key) === request) inFlight.delete(key);
  }
}

function productsKey(
  slug: string,
  params: { page?: number; limit?: number; category?: string; search?: string },
): string {
  const normalized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([field, value]) => `${field}=${String(value).trim().toLowerCase()}`)
    .join("&");

  // O hash mantém a chave curta mesmo quando a busca contém muitos
  // caracteres e evita que parâmetros do usuário inflem o keyspace.
  const fingerprint = createHash("sha256")
    .update(normalized || "default")
    .digest("hex")
    .slice(0, 20);

  return `${KEY_PREFIX}:products:${encodeURIComponent(slug)}:${fingerprint}`;
}

export const catalog = {
  getStore: (slug: string) =>
    readThrough<Store>(`${KEY_PREFIX}:store:${encodeURIComponent(slug)}`, TTL.store, () =>
      api.getStore(slug),
    ),

  getProducts: (
    slug: string,
    params: { page?: number; limit?: number; category?: string; search?: string } = {},
  ) =>
    readThrough<Paginated<Product>>(
      productsKey(slug, params),
      TTL.products,
      () => api.getProducts(slug, params),
    ),

  getCategories: (slug: string) =>
    readThrough<Category[]>(
      `${KEY_PREFIX}:categories:${encodeURIComponent(slug)}`,
      TTL.categories,
      () => api.getCategories(slug),
    ),

  getProduct: (id: string) =>
    readThrough<Product>(
      `${KEY_PREFIX}:product:${encodeURIComponent(id)}`,
      TTL.product,
      () => api.getProduct(id),
    ),
};
