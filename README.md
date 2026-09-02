# Luan Motos — Showroom & CRM

Plataforma comercial da Luan Motos: showroom público, estoque, CRM em Kanban, agenda, metas e relatórios de mídia e vendas.

## Stack

- React 19 + Next.js/Vinext + TypeScript
- Cloudflare D1 + Drizzle para dados estruturados
- Cloudflare R2 para fotos do estoque
- Interface responsiva para desktop e celular

## Rotas

- `/` — showroom público
- `/motos/[slug]` — página individual da moto
- `/painel` — área administrativa protegida
- `/api/inventory` — estoque publicado
- `/api/interests` — entrada de leads do site
- `/api/crm` — operações administrativas
- `/api/upload` e `/api/media/*` — fotos do estoque

## Desenvolvimento

```bash
npm run install:ci
npm run dev
```

## Banco de dados

O schema fica em `db/schema.ts`. Após alterações:

```bash
npm run db:generate
```

As migrações geradas em `drizzle/` devem acompanhar o código.

## Validação

```bash
npm run lint
npm test
```

## Deploy

O build de produção é gerado com `npm run build`. Mantenha os bindings `DB` e `BUCKET` configurados no ambiente e nunca publique credenciais no repositório.
