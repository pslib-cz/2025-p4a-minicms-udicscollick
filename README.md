# Toulky

Mini CMS postavené v `Next.js App Router` pro publikování cestovatelských tipů. Aplikace obsahuje veřejnou část, interní dashboard a vlastní API. Každý přihlášený uživatel vidí a upravuje pouze svůj vlastní obsah.

## Stack

- `Next.js 16` + `React 19`
- `Prisma ORM`
- `Auth.js / NextAuth Credentials`
- `Mantine` pro dashboard
- `TipTap` WYSIWYG editor
- `Zod` + `React Hook Form`
- lokálně `SQLite`
- pro deploy `PostgreSQL`

## Datový model

Hlavní entity:

- `User`
- `Article`
- `Category`
- `Tag`
- `ArticleTag`

Vztahy:

- `User -> Article` je `1:N`
- `Category -> Article` je `1:N`
- `Article <-> Tag` je `N:M` přes `ArticleTag`

`Article` obsahuje:

- `title`
- `slug`
- `excerpt`
- `contentHtml`
- `coverImageUrl`
- `status`
- `publishDate`
- `createdAt`
- `updatedAt`

## Funkce

### Veřejná část

- seznam publikovaných článků
- detail článku přes dynamic route `/articles/[slug]`
- vyhledávání podle titulku, perexu a obsahu
- filtrování podle kategorií a tagů
- stránkování
- dynamická metadata pro detail
- OpenGraph metadata
- canonical URL
- `sitemap.xml`
- `robots.txt`
- `next/image`
- ISR/revalidate pro veřejné stránky

### Dashboard

- přihlášení přes Auth.js credentials
- pouze přihlášený uživatel vstoupí do dashboardu
- uživatel pracuje jen se svými články, kategoriemi a tagy
- seznam vlastních článků se stránkováním
- vytvoření, editace a smazání článku
- změna statusu `draft/published`
- WYSIWYG editor
- validace formulářů

### API

- `GET/POST /api/articles`
- `GET/PUT/PATCH/DELETE /api/articles/[id]`
- `GET/POST /api/categories`
- `PUT/DELETE /api/categories/[id]`
- `GET/POST /api/tags`
- `PUT/DELETE /api/tags/[id]`
- session check v každém chráněném endpointu
- ownership check v každém mutačním endpointu
- server-side validace přes Zod

## Lokální spuštění

1. Nainstalujte závislosti:

```bash
npm install
```

2. Zkopírujte `.env.example` do `.env.local` a doplňte alespoň:

- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`

3. Připravte databázi a seed:

```bash
npm run db:setup
```

4. Spusťte vývojový server:

```bash
npm run dev
```

5. Otevřete `http://localhost:3000`

Přihlašovací účet:

- `eva@toulky.cz / heslo123`

## Důležité skripty

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run db:setup
```

## Deploy na Vercel

- pripojte PostgreSQL databazi
- aplikace umi cist jak `DATABASE_URL`, tak i Vercel Postgres promenne `POSTGRES_PRISMA_URL` a `POSTGRES_URL_NON_POOLING`
- pokud nepouzivate Vercel Postgres integraci, nastavte `DATABASE_URL` a `DIRECT_URL` rucne
- nastavte `AUTH_SECRET`
- nastavte `NEXTAUTH_URL` na produkční URL
- nastavte `NEXT_PUBLIC_SITE_URL` na produkční URL
- build script automaticky přegeneruje Prisma client a při PostgreSQL spustí `prisma migrate deploy`

Repo obsahuje samostatné migrace pro:

- `prisma/sqlite/migrations` pro lokální vývoj
- `prisma/postgres/migrations` pro produkční PostgreSQL

## Seed a demo data

Seed vytváří:

- 1 uživatele
- více kategorií a tagů pro jeden účet
- mix publikovaných i draft článků

## Co zůstává po deployi

Zadání počítá ještě s kroky, které dávají smysl až po živém nasazení:

- napojení analytiky
- cookie consent
- Lighthouse audit
- Google Search Console
- Bing Webmaster Tools

Tyto kroky je vhodné dokončit až nad reálnou veřejnou URL.
