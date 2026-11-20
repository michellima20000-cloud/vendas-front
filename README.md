# Vendas Black — Front-end

Vitrine e painel do lojista em **Next.js 15 + React 19 + Tailwind CSS**.

- Site: https://vendas-front.onrender.com
- API: https://vendas-black.onrender.com/api/v1

## Rodar localmente

```bash
npm install
cp .env.example .env.local
# Ajuste NEXT_PUBLIC_API_URL se a API não estiver em http://localhost:3001/api/v1
npm run dev
```

A API precisa estar rodando (veja o repositório `vendas-black`). O `.env.local`
não é versionado; ele guarda a URL da API e as credenciais privadas do Redis.

## Cache do catálogo com Upstash Redis

As páginas públicas de loja e produto usam um cache *read-through* no Upstash
Redis. A primeira visita busca os dados na API; as seguintes são servidas pelo
Redis até o TTL expirar.

| Dado | TTL |
| --- | ---: |
| Loja | 60 segundos |
| Lista de produtos | 60 segundos |
| Categorias | 300 segundos |
| Detalhe do produto | 60 segundos |

O cache é apenas uma otimização: se o Redis estiver sem credenciais, fora do ar
ou lento, a aplicação ignora o cache e continua consultando a API. O módulo do
Redis é `server-only`, portanto o token nunca é enviado ao navegador.

Configure estas variáveis no ambiente do servidor:

```bash
UPSTASH_REDIS_REST_URL=https://seu-banco.upstash.io
UPSTASH_REDIS_REST_TOKEN=seu-token-de-leitura-e-escrita
```

Como o cache expira por tempo, uma alteração feita no painel pode levar até 60
segundos (ou 5 minutos para categorias) para aparecer na vitrine pública.

## Deploy no Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/michellima20000-cloud/vendas-front)

1. **New → Blueprint** apontando para este repositório (usa o `render.yaml`).
2. Defina `NEXT_PUBLIC_API_URL` com a URL pública da API:
   `https://vendas-black.onrender.com/api/v1`.
3. Defina `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
4. No backend, informe a URL do front em `FRONTEND_URL` para o CORS.
5. Rode o build novamente se mudar `NEXT_PUBLIC_API_URL` — ela é embutida no
   bundle durante o build.

O serviço free hiberna após alguns minutos sem tráfego; a primeira requisição
pode demorar aproximadamente um minuto.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servidor de produção
npm run lint     # ESLint
```
