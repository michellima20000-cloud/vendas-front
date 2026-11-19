# Vendas Black — Front-end

Vitrine e painel do lojista em **Next.js 15 + React 19 + Tailwind CSS**.

## Rodar localmente

```bash
npm install
cp .env.example .env.local
# Edite NEXT_PUBLIC_API_URL se a API não estiver em http://localhost:3001/api/v1
npm run dev
```

A API precisa estar rodando (veja o repositório `vendas-black`).

## Deploy no Render

1. **New → Blueprint** apontando para este repositório (usa o `render.yaml`).
2. Defina `NEXT_PUBLIC_API_URL` com a URL pública da API, por exemplo:
   `https://vendas-black.onrender.com/api/v1`
3. No backend, ajuste `FRONTEND_URL` para a URL deste front (CORS).
4. Rode o build novamente se mudar `NEXT_PUBLIC_API_URL` — ela é embutida no build.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servidor de produção
npm run lint     # ESLint
```
