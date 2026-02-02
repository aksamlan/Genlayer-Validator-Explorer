"use client";

import { useEffect, useState } from 'react';
import { validatorService } from '@/lib/validator-service';
import { NetworkOverview } from '@/components/NetworkOverview';
import { ValidatorTable } from '@/components/ValidatorTable';
import { LinksSection } from '@/components/LinksSection';
import { DEFAULT_NETWORK, NetworkConfig } from '@/lib/networks';
import type { NetworkStats } from '@/types/validator';
import { getBlockNumber } from '@/lib/viem-client';
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
    const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(DEFAULT_NETWORK);
    const [blockNumber, setBlockNumber] = useState<string>('0');
    const [networkUptime, setNetworkUptime] = useState<string>('');
    const [networkMetrics, setNetworkMetrics] = useState({
        chainId: 0,
        gasPrice: '0',
        avgBlockTime: '0'
    });

    const fetchData = async (network: NetworkConfig = currentNetwork) => {
        try {
            const stats = await validatorService.getNetworkStats(network);
            setNetworkStats(stats);

            // Fetch additional metrics using Viem
            try {
                const client = (await import('viem')).createPublicClient({
                    transport: (await import('viem')).http(network.rpcUrl)
                });

                const [blockNum, chainId, gasPrice, latestBlock] = await Promise.all([
                    client.getBlockNumber(),
                    client.getChainId(),
                    client.getGasPrice(),
                    client.getBlock({ blockTag: 'latest' })
                ]);

                setBlockNumber(blockNum.toString());

                // Calculate average block time (last 100 blocks)
                const oldBlock = await client.getBlock({ blockNumber: blockNum - 100n });
                const timeDiff = Number(latestBlock.timestamp - oldBlock.timestamp);
                const avgTime = timeDiff / 100;

                setNetworkMetrics({
                    chainId,
                    gasPrice: (Number(gasPrice) / 1e9).toFixed(4),
                    avgBlockTime: avgTime.toFixed(2)
                });

                // Calculate network uptime (genesis block: 4632386)
                const genesisBlock = await client.getBlock({ blockNumber: 4632386n });
                const uptimeSeconds = Number(latestBlock.timestamp - genesisBlock.timestamp);
                const days = Math.floor(uptimeSeconds / 86400);
                const hours = Math.floor((uptimeSeconds % 86400) / 3600);
                setNetworkUptime(`${days}d ${hours}h`);
            } catch (e) {
                console.warn('Could not fetch additional metrics:', e);
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
        <main className="min-h-screen p-8 md:p-12 space-y-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <Link href="/" className="flex items-center gap-4 group w-fit">
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <Image
                                src="/logo.jpg"
                                alt="GenLayer Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient tracking-tighter">
                                GENLAYER
                            </h1>
                            <p className="text-muted-foreground uppercase tracking-[0.3em] text-xs font-bold mt-1 ml-1 group-hover:text-primary transition-colors">
                                Intelligent Blockchain Explorer
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 mt-4 ml-1 glass w-fit px-3 py-1.5 rounded-full border-primary/20 bg-primary/5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Asimov Network</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchData()}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group border border-white/5 hover:border-primary/20 hover:shadow-[0_0_20_rgba(165,90,45,0.2)]"
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn(
                                "h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-700",
                                isLoading ? 'animate-spin text-primary' : 'group-hover:rotate-180'
                            )} />
                        </button>

                        {lastUpdate && (
                            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 bg-white/[0.02] px-3 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                                <Clock className="h-3 w-3" />
                                <span>{lastUpdate.toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 font-mono shadow-inner group">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest group-hover:text-primary transition-colors">Latest Block</span>
                        <div className="flex items-center gap-2">
                            <Box className="h-3 w-3 text-primary animate-pulse-slow" />
                            <span className="text-lg font-black tracking-tighter text-foreground group-hover:scale-105 transition-transform">{formatFullNumber(blockNumber)}</span>
                        </div>
                    </div>

                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-4 animate-in slide-in-from-right-4 duration-500 glass">
                    <div className="h-3 w-3 rounded-full bg-destructive animate-ping" />
                    <div className="flex-1">
                        <span className="uppercase tracking-widest mr-2 opacity-70">Error:</span>
                        {error}
                    </div>
                    <button onClick={() => fetchData()} className="px-3 py-1 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors uppercase text-[10px]">Retry</button>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-primary rounded-full" />
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground/90">Network Stats</h2>
                    </div>
                </div>
                <NetworkOverview
                    epochInfo={networkStats?.epochInfo || null}
                    isLoading={isLoading}
                    uptime={networkUptime}
                    metrics={networkMetrics}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-accent rounded-full" />
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground/90">
                            Staking Registry
                        </h2>
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
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-white/20 rounded-full" />
                    <h2 className="text-xl font-black uppercase tracking-widest text-foreground/90">
                        Official Resources
                    </h2>
                </div>
                <LinksSection />
            </div>

            <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                <div className="flex flex-col gap-2">
                    <p className="hover:text-primary transition-colors duration-500 cursor-default">
                        © 2026 GenLayer Explorer System • Core Protocol v4.0
                    </p>
                    <p className="flex items-center gap-2">
                        Developed by <a href="https://husonode.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-accent transition-colors">HusoNode</a>
                        <span className="text-white/10">•</span>
                        <a href="mailto:contact@husonode.xyz" className="hover:text-foreground transition-colors">contact@husonode.xyz</a>
                    </p>
                </div>
                <div className="flex items-center gap-8">
                    <span className="flex items-center gap-2 group cursor-default">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(165,90,45,0.6)] group-hover:scale-150 transition-transform" />
                        <span className="group-hover:text-primary transition-colors">Nodes Operational</span>
                    </span>
                    <span className="text-primary/70 hover:text-primary transition-colors cursor-default">Powered by GenLayer Intelligent Framework</span>
                </div>
            </footer>
        </main>
    );
}
