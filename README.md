# HusoNode GenLayer Explorer

![GenLayer Explorer Screenshot](public/logo.jpg)

**HusoNode GenLayer Explorer** is a high-performance, real-time blockchain explorer designed for the **GenLayer Asimov Network**. It allows users to monitor network statistics, validator status, and staking information with a premium, verified interface.

## 🚀 Features

*   **Real-time Network Metrics**: Displays Chain ID, Gas Price, Average Block Time, and Network Uptime live.
*   **Validator Registry**: Comprehensive list of active validators with search and filtering capabilities.
*   **Live Updates**: Automatic **30-second polling** (RPC-friendly) to keep data fresh without overloading the network.
*   **Premium UX/UI**: Glassmorphism design, dark mode, animation effects, and fully responsive layout.
*   **Viem Integration**: Powered by `viem` for robust and high-speed blockchain interactions, replacing legacy SDKs.
*   **HusoNode Branding**: Custom branding and navigation for the HusoNode ecosystem.

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

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

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
