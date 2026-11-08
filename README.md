# Bolea Cristina – gyakorlat órarend

Mini webapp: a tanárnő órarendje (az EduPage-ről), amire a diákok heti 3 órára beírhatják magukat
(óránként max. 5 fő). Cloudflare Pages + Functions + D1 (SQLite), build lépés nincs.

## Azonosítás jelszó nélkül
- **Diák**: mindenkinek van egy titkos személyes linkje (`https://…/?t=TOKEN`). Első megnyitáskor a böngésző megjegyzi.
- **Admin (csoportvezető)**: `ADMIN_KEY` titok; az oldalon *Admin* gomb → kulcs beírása (vagy `?admin=KULCS`).
  Admin panel: diákok felvétele, személyes linkek másolása/újragenerálása; bárkit be/ki lehet írni (limiten túl is, megerősítéssel).
- **Tanárnő**: a sima link (`https://…/?lang=ro`), csak megtekintés, román nyelven.

Szabályok (`functions/api/[[route]].js` → `LIMITS`): max 5 fő/óra, 3 óra/diák/hét (a 2–3 órás blokkok óránként külön foglalhatók),
a már elkezdődött órán a diák nem módosíthat, a „Dezvoltare personala" nem választható.

## Helyi futtatás
    npm install
    npm run db:local     # táblák a helyi D1-ben
    npm run dev          # http://localhost:8788  (admin kulcs: dev-admin)

## Éles (Cloudflare)
    npx wrangler d1 create orar-praktika      # a database_id-t írd be a wrangler.toml-ba
    npm run db:remote
    npx wrangler pages project create orar-praktika --production-branch main
    npx wrangler pages secret put ADMIN_KEY --project-name orar-praktika
    npm run deploy

## Órarend frissítése
`npm run schedule` újratölti az EduPage-ről a `public/schedule.json`-t (ugyanazok a végpontok, mint az `eminescu-orar` repóban),
majd `npm run deploy`. A beiratkozások `nap-óra` kulccsal vannak tárolva, ezért kisebb módosításnál megmaradnak.
