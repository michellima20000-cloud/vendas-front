import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Cliente Upstash Redis (HTTP/REST).
 *
 * Variáveis necessárias (em .env.local ou no ambiente do Render):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Este módulo é exclusivo do servidor (Server Components e Route Handlers).
 * O import de "server-only" impede que as credenciais sejam incluídas em um
 * bundle enviado ao navegador.
 *
 * Se as variáveis não estiverem configuradas, o cliente fica `null` e quem
 * consome deve cair no caminho sem cache (ver `src/lib/catalog.ts`).
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(url && token);

export const redis =
  url && token
    ? new Redis({
        url,
        token,
        enableAutoPipelining: true,
        retry: { retries: 1 },
        signal: () => AbortSignal.timeout(2000),
        cache: "no-store",
      })
    : null;
