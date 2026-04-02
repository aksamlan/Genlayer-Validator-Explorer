"use client";

import { useEffect, useState } from 'react';
import { validatorService } from '@/lib/validator-service';
import { NetworkOverview } from '@/components/NetworkOverview';
import { ValidatorTable } from '@/components/ValidatorTable';
import { AlertSection } from '@/components/AlertSection';
import { LinksSection } from '@/components/LinksSection';
import { DEFAULT_NETWORK, NetworkConfig } from '@/lib/networks';
import type { NetworkStats } from '@/types/validator';
import { RefreshCw, Clock, Box } from 'lucide-react';
import { formatNumber, formatFullNumber, cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const POLLING_INTERVAL = 30000; // 30 seconds

export default function Home() {
    const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [currentNetwork] = useState<NetworkConfig>(DEFAULT_NETWORK);
    const [blockNumber, setBlockNumber] = useState<string>('0');
    const [networkMetrics] = useState({
        chainId: currentNetwork.displayChainId,
        gasPrice: '0',
        avgBlockTime: '0'
    });

    const fetchData = async (network: NetworkConfig = currentNetwork) => {
        try {
            const stats = await validatorService.getNetworkStats(network);
            setNetworkStats(stats);

            // Fetch block number from ZKSync staking layer
            try {
                const evmRpcUrl = network.evmRpcUrl || network.rpcUrl;
                const { createPublicClient, http } = await import('viem');
                const evmClient = createPublicClient({ transport: http(evmRpcUrl) });
                const blockNum = await evmClient.getBlockNumber();
                setBlockNumber(blockNum.toString());
            } catch (e) {
                console.warn('Could not fetch block number:', e);
            }

            setLastUpdate(new Date());
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(), POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-10 space-y-10">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <Link href="/" className="flex items-center gap-4 group w-fit">
                            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                                <Image src="/logo.jpg" alt="GenLayer Logo" fill className="object-cover" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary tracking-tighter">
                                    GENLAYER
                                </h1>
                                <p className="text-muted-foreground uppercase tracking-[0.25em] text-[10px] font-bold mt-0.5 group-hover:text-primary transition-colors">
                                    Validator Explorer
                                </p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2 mt-3 glass w-fit px-3 py-1.5 rounded-full border-primary/20 bg-primary/5">
                            <span className="relative flex h-2 w-2 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                GenLayer Testnet · Chain {currentNetwork.displayChainId}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={() => fetchData()}
                            disabled={isLoading}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/5 hover:border-primary/20"
                        >
                            <RefreshCw className={cn(
                                "h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-500",
                                isLoading ? 'animate-spin text-primary' : 'group-hover:rotate-180'
                            )} />
                        </button>

                        {lastUpdate && (
                            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 bg-white/[0.02] px-3 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                                <Clock className="h-3 w-3" />
                                <span>{lastUpdate.toLocaleTimeString()}</span>
                            </div>
                        )}

                        <div className="flex flex-col items-end px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 font-mono group">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-widest">Latest Block</span>
                            <div className="flex items-center gap-1.5">
                                <Box className="h-3 w-3 text-primary animate-pulse-slow" />
                                <span className="text-base font-black tracking-tighter text-foreground">{formatFullNumber(blockNumber)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-4 glass">
                        <div className="h-3 w-3 rounded-full bg-destructive animate-ping flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="uppercase tracking-widest mr-2 opacity-70">Error:</span>
                            {error}
                        </div>
                        <button onClick={() => fetchData()} className="px-3 py-1 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors uppercase text-[10px] flex-shrink-0">
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Network Stats ── */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-primary rounded-full" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground/70">Network Stats</h2>
                    </div>
                    <NetworkOverview
                        epochInfo={networkStats?.epochInfo || null}
                        isLoading={isLoading}
                        metrics={networkMetrics}
                    />
                </section>

                {/* ── Staking Registry ── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-accent rounded-full" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground/70">Staking Registry</h2>
                        </div>
                        <div className="flex items-center gap-2 glass px-3 py-1 rounded-full border-primary/20">
                            <span className="text-[10px] font-black tracking-widest text-primary uppercase">Asset</span>
                            <div className="h-3 border-r border-white/10 mx-1" />
                            <span className="text-xs font-black">{currentNetwork.tokenSymbol}</span>
                        </div>
                    </div>
                    <ValidatorTable
                        validators={networkStats?.validators || []}
                        isLoading={isLoading}
                        tokenSymbol={currentNetwork.tokenSymbol}
                    />
                </section>

                {/* ── Validator Alerts (only renders when there are banned/inactive) ── */}
                <AlertSection validators={networkStats?.validators || []} />

                {/* ── Official Resources ── */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-white/20 rounded-full" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground/70">Official Resources</h2>
                    </div>
                    <LinksSection />
                </section>

                {/* ── Footer ── */}
                <footer className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                    <div className="flex flex-col items-center sm:items-start gap-1.5">
                        <p>© 2026 GenLayer Explorer System</p>
                        <p className="flex items-center gap-2">
                            By{" "}
                            <a href="https://husonode.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-accent transition-colors">
                                HusoNode
                            </a>
                            <span className="text-white/10">•</span>
                            <a href="mailto:contact@husonode.xyz" className="hover:text-foreground transition-colors">
                                contact@husonode.xyz
                            </a>
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(165,90,45,0.6)]" />
                            Nodes Operational
                        </span>
                        <span className="text-primary/70">Powered by GenLayer</span>
                    </div>
                </footer>

            </main>
        </div>
    );
}
