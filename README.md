# HusoNode GenLayer Explorer

![GenLayer Explorer Screenshot](public/logo.jpg)

A comprehensive, real-time blockchain explorer for **GenLayer Testnet Bradbury (Phase 2)** — blocks, transactions, validators, and addresses in one place. The sunset Asimov testnet is hidden but can be re-enabled with `NEXT_PUBLIC_ENABLE_ASIMOV=true`.

## 🚀 Features

### Block Explorer
*   **Block list & detail pages** (`/blocks`, `/block/[number]`) with paginated history, miner, gas usage bars, and per-block transaction lists.
*   **Transaction feed & detail pages** (`/txs`, `/tx/[hash]`) with status, gas, input data, and full event logs.
*   **Address pages** (`/address/[address]`) with balance, tx count, contract detection, and bytecode preview.
*   **Universal search bar** that auto-routes to the right page based on input (block number, tx hash, or address).

### Validator Tools
*   **Validator registry** (`/validators`) with search, filtering, and per-validator drilldown.
*   **Validator profile pages** (`/validator/[address]`) — identity card, stake breakdown, pending ops, on-chain details.
*   **"My Node" highlight** — set `NEXT_PUBLIC_OWNER_VALIDATOR` to feature your own validator on the dashboard with a crown badge, status, unclaimed-rewards flag and share of network stake.
*   **Identity fallback** — validators that haven't set an identity on Bradbury Phase 2 yet show the name they used on an earlier testnet (matched by operator/owner wallet, marked `prev`). Snapshot: `lib/legacy-identities.json`, regenerate with `npx tsx scripts/snapshot-legacy-identities.ts`.
*   **Validator statuses** — Active, Pending (staked, joins the set next epoch), Quarantined, Banned, Inactive — with filter tabs in the registry.

### Staking Overview (v0.6 contracts)
*   **Epoch countdown** — live timer and progress bar to the next epoch, plus the last finalized epoch.
*   **Validator set** — joined, active (selectable), pending, quarantined and banned counts.
*   **Stake** — total staked, pending deposits, validator/delegator minimums, current-epoch inflation.
*   **Rewards** — how many validators have unclaimed rewards.

### Live Metrics
*   **Gas price tracker** with sparkline (`recharts`).
*   **Block time chart** (rolling last 20 blocks).
*   **TPS gauge** over the last 8 blocks.
*   **Stake distribution donut** (top 7 + rest).
*   **RPC health indicator** with latency probe.
*   **Recent blocks / recent transactions** widgets.

### Multi-Network
*   **Runtime network switcher** in the header — **Bradbury Phase 2** only by default; set `NEXT_PUBLIC_ENABLE_ASIMOV=true` to bring back the sunset **Asimov** testnet as a second option.
*   **Per-network selection is persisted** to `localStorage`, so your choice sticks across reloads.
*   Every surface (hero branding, chain id, explorer link, blocks, transactions, gas, validator registry, "My Node") follows the selected network — each network has its own chain, staking contract and validator set.
*   RPC calls are capped at 4 in flight per endpoint and retried on HTTP 429, since the Bradbury public RPC rate-limits bursts.

### UX
*   **Sticky nav with mobile drawer**, **30-second polling**, glassmorphism with breathing room, dark theme.
*   **Powered by `viem`** for the EVM layer and a thin JSON-RPC wrapper for GenLayer's `gen_*` methods.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Blockchain Client**: [Viem](https://viem.sh/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

*   Node.js 18+
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/husonode/genlayer-explorer.git
    cd genlayer-explorer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure your environment in `.env.local`:
    ```bash
    # Bradbury Phase 2 (default network) — optional overrides; the built-in
    # defaults in config/genlayer.ts point at https://rpc.testnet-chain.genlayer.com
    NEXT_PUBLIC_BRADBURY_RPC_URL=
    NEXT_PUBLIC_BRADBURY_EVM_RPC_URL=
    NEXT_PUBLIC_BRADBURY_EXPLORER_URL=

    # Asimov (sunset, hidden) — only used with NEXT_PUBLIC_ENABLE_ASIMOV=true
    NEXT_PUBLIC_ENABLE_ASIMOV=
    NEXT_PUBLIC_GENLAYER_RPC_URL=https://rally-testnet.genlayer.com/api
    NEXT_PUBLIC_EVM_RPC_URL=https://zksync-os-testnet-genlayer.zksync.dev

    # Optional: highlight your own validator on the dashboard (per network)
    NEXT_PUBLIC_OWNER_VALIDATOR=0xYourAsimovValidatorAddress
    NEXT_PUBLIC_BRADBURY_OWNER_VALIDATOR=0xYourBradburyValidatorAddress
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📚 Operator Guides

If you run a validator and want the most out of the explorer:

- **[Set your on-chain identity](./docs/SET_IDENTITY.md)** — moniker, logo, website, twitter, github, telegram, email. Once set, the explorer surfaces them in the registry table, hero, and validator profile automatically. Three methods: GenLayer CLI, Foundry `cast`, or viem script.
- **[Deploy the explorer](./docs/DEPLOY.md)** — Vercel (recommended), Docker, or Cloudflare Pages. Includes env-var checklist and custom-domain steps.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Main dashboard page
│   └── globals.css       # Global styles with Tailwind directives
├── components/           # Reusable UI components
│   ├── NetworkOverview.tsx  # Network statistics cards
│   ├── NetworkSwitcher.tsx  # Header network switcher (label when only one network)
│   ├── ValidatorTable.tsx   # Searchable validator list
│   ├── LinksSection.tsx     # Official resources & referral links
│   └── ...
├── lib/                  # Utilities and services
│   ├── viem-client.ts       # Staking contract reads (v0.5 + v0.6 ABIs)
│   ├── explorer-rpc.ts      # Blocks / txs / addresses for the selected network
│   ├── rpc-transport.ts     # Rate-limit-friendly viem transport
│   ├── networks.ts          # Network registry (Bradbury; Asimov behind a flag)
│   └── network-context.tsx  # NetworkProvider + useNetwork() hook
└── public/               # Static assets (logos, icons)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

**Developed by [HusoNode](https://husonode.xyz)**
