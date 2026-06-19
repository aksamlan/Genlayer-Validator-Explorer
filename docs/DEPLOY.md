# Deploying the Explorer

The explorer is a pure-client Next.js 15 app. It only reads from public RPCs, so there's no backend to manage and no secrets to ship.

## Option 1 — Vercel (recommended)

### 1. Push to GitHub

The repo lives on GitHub already. Make sure your `main` branch is up to date:

```bash
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Vercel auto-detects **Next.js**. Leave the build settings on defaults:
   - **Build command:** `next build`
   - **Output directory:** `.next`
   - **Install command:** `npm install`

### 3. Set environment variables

In the Vercel project's **Settings → Environment Variables**, add:

| Name | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://rally-testnet.genlayer.com/api` | Rally testnet JSON-RPC |
| `NEXT_PUBLIC_EVM_RPC_URL` | `https://zksync-os-testnet-genlayer.zksync.dev` | Staking layer (ZKSync OS) |
| `NEXT_PUBLIC_OWNER_VALIDATOR` | `0xYourValidatorAddress` | Optional — enables My Node card |

Apply each variable to the **Production**, **Preview**, and **Development** environments.

### 4. Deploy

Click **Deploy**. First build takes 60–90s. Your explorer is live at `<project-name>.vercel.app`.

### 5. Custom domain

In **Settings → Domains**, add your custom domain (e.g. `explorer.husonode.xyz`) and follow the DNS instructions Vercel shows. SSL is automatic.

### 6. Update on every push

Every push to `main` triggers a production redeploy. Every PR gets a preview URL automatically. No manual steps after the first import.

---

## Option 2 — Docker

A `Dockerfile` ships with the repo. Build & run:

```bash
docker build -t genlayer-explorer .
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_GENLAYER_RPC_URL=https://rally-testnet.genlayer.com/api \
  -e NEXT_PUBLIC_EVM_RPC_URL=https://zksync-os-testnet-genlayer.zksync.dev \
  -e NEXT_PUBLIC_OWNER_VALIDATOR=0xYourValidatorAddress \
  --name explorer \
  genlayer-explorer
```

Or use the `docker-compose.yml` and `docker compose up -d`.

If you're behind a reverse proxy (Caddy, Nginx, Traefik), point it at `http://127.0.0.1:3000`. For TLS, terminate at the proxy.

---

## Option 3 — Cloudflare Pages

1. Connect the GitHub repo in the Cloudflare Pages dashboard.
2. Framework preset: **Next.js**.
3. Build command: `npm run build`.
4. Build output: `.next`.
5. Add the same env vars as the Vercel table above.
6. Deploy.

Note: Cloudflare Pages runs on Workers, which means dynamic routes will be served from edge functions. The standard Next.js dynamic routes used here work fine on this runtime.

---

## Pre-flight checklist

Before announcing your deploy:

- [ ] All four nav routes load (`/`, `/blocks`, `/txs`, `/validators`)
- [ ] Search bar resolves: block number → `/block/N`, tx hash → `/tx/H`, address → `/address/A`
- [ ] My Node card appears on `/` (if `NEXT_PUBLIC_OWNER_VALIDATOR` is set)
- [ ] Live gas + block time charts populate within ~30 seconds
- [ ] Validator detail page shows your moniker / socials (set via [docs/SET_IDENTITY.md](./SET_IDENTITY.md) if empty)
- [ ] Mobile drawer nav opens and links work

If any of the above is off, check the browser console — most issues are RPC timeouts or env-var typos.

---

## Performance & cost

- RPC traffic is **client-side only** — Vercel/Cloudflare egress is just static asset delivery.
- Each visitor's tab polls every 6–30s while open. With 1,000 daily visitors averaging 2 min/session, you'll see ~10–15 RPC requests per visitor, which is well within the free public Rally testnet RPC quota.
- If you ever hit RPC rate limits, point `NEXT_PUBLIC_*_RPC_URL` at your own node.
