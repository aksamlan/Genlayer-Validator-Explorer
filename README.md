# HusoNode GenLayer Explorer

![GenLayer Explorer Screenshot](public/logo.jpg)

A comprehensive, real-time blockchain explorer for the **GenLayer Rally / Asimov Testnet** — blocks, transactions, validators, addresses, and AI-augmented intelligent contracts in one place.

## 🚀 Features

### Block Explorer
*   **Block list & detail pages** (`/blocks`, `/block/[number]`) with paginated history, miner, gas usage bars, and per-block transaction lists.
*   **Transaction feed & detail pages** (`/txs`, `/tx/[hash]`) with status, gas, input data, and full event logs.
*   **Address pages** (`/address/[address]`) with balance, tx count, contract detection, and bytecode preview.
*   **Universal search bar** that auto-routes to the right page based on input (block number, tx hash, or address).

### Validator Tools
*   **Validator registry** (`/validators`) with search, filtering, and per-validator drilldown.
*   **Validator profile pages** (`/validator/[address]`) — identity card, stake breakdown, pending ops, on-chain details.
*   **"My Node" highlight** — set `NEXT_PUBLIC_OWNER_VALIDATOR` to feature your own validator on the dashboard with a crown badge.

### Intelligent Contracts (GenVM)
*   **Contracts registry** (`/contracts`) — curated list of intelligent contracts on the Rally testnet.
*   **Contract detail pages** (`/contract/[address]`) — schema, methods, state fields fetched via `gen_getContractSchema`.
*   **GenVM explainer** describing GenLayer's optimistic-democracy consensus over LLM-augmented contracts.

### Live Metrics
*   **Gas price tracker** with sparkline (`recharts`).
*   **Block time chart** (rolling last 20 blocks).
*   **TPS gauge** over the last 8 blocks.
*   **Stake distribution donut** (top 7 + rest).
*   **RPC health indicator** with latency probe.
*   **Recent blocks / recent transactions** widgets.

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
    NEXT_PUBLIC_GENLAYER_RPC_URL=https://rally-testnet.genlayer.com/api
    NEXT_PUBLIC_EVM_RPC_URL=https://zksync-os-testnet-genlayer.zksync.dev

    # Optional: highlight your own validator on the dashboard
    NEXT_PUBLIC_OWNER_VALIDATOR=0xYourValidatorAddress

    # Optional: curated AI contracts for the /contracts page
    NEXT_PUBLIC_KNOWN_CONTRACTS=0xaddr:Name, 0xaddr:Name
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Main dashboard page
│   └── globals.css       # Global styles with Tailwind directives
├── components/           # Reusable UI components
│   ├── NetworkOverview.tsx  # Network statistics cards
│   ├── ValidatorTable.tsx   # Searchable validator list
│   ├── LinksSection.tsx     # Official resources & referral links
│   └── ...
├── lib/                  # Utilities and services
│   ├── viem-client.ts    # Direct blockchain interaction
│   └── networks.ts       # Network configuration
└── public/               # Static assets (logos, icons)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

**Developed by [HusoNode](https://husonode.xyz)**
