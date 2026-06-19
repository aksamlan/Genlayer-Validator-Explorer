import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToasterProvider } from "@/components/Toaster";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "GenLayer Explorer | Blocks · Transactions · Validators · AI Contracts",
    description:
        "Real-time blockchain explorer for the GenLayer Asimov / Rally Testnet — transactions, blocks, validators, AI-augmented intelligent contracts, and live network statistics.",
    icons: { icon: '/logo.jpg' },
    openGraph: {
        title: "GenLayer Explorer",
        description: "Comprehensive blockchain explorer for the GenLayer Testnet.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`dark ${inter.variable} ${jetBrainsMono.variable}`}>
            <body className={`${inter.className} min-h-screen flex flex-col font-sans`}>
                <ToasterProvider>
                    <Header />
                    <div className="flex-1 page-enter">{children}</div>
                    <Footer />
                </ToasterProvider>
            </body>
        </html>
    );
}
