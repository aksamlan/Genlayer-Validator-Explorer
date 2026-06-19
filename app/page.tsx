"use client";

import { useEffect, useState } from 'react';
import { validatorService } from '@/lib/validator-service';
import { DEFAULT_NETWORK, NetworkConfig } from '@/lib/networks';
import type { NetworkStats } from '@/types/validator';
import { getOwnerValidatorAddress } from '@/lib/my-node';
import { getLatestBlockNumber } from '@/lib/explorer-rpc';

import { SectionHeader } from '@/components/SectionHeader';
import { HeroBanner } from '@/components/HeroBanner';
import { HeroStats } from '@/components/widgets/HeroStats';
import { GasTracker } from '@/components/widgets/GasTracker';
import { BlockTimeChart } from '@/components/widgets/BlockTimeChart';
import { TpsGauge } from '@/components/widgets/TpsGauge';
import { NetworkHealth } from '@/components/widgets/NetworkHealth';
import { EpochProgress } from '@/components/widgets/EpochProgress';
import { MyNodeCard } from '@/components/widgets/MyNodeCard';
import { StakeDistribution } from '@/components/widgets/StakeDistribution';
import { RecentBlocksWidget } from '@/components/widgets/RecentBlocksWidget';
import { RecentTxsWidget } from '@/components/widgets/RecentTxsWidget';
import { AlertSection } from '@/components/AlertSection';
import { LinksSection } from '@/components/LinksSection';
import { Sparkles } from 'lucide-react';

const POLLING_INTERVAL = 30_000;

export default function Home() {
    const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [blockNumber, setBlockNumber] = useState<string>('0');
    const [currentNetwork] = useState<NetworkConfig>(DEFAULT_NETWORK);
    const owner = getOwnerValidatorAddress();

    const fetchData = async (network: NetworkConfig = currentNetwork) => {
        try {
            const stats = await validatorService.getNetworkStats(network);
            setNetworkStats(stats);
            try {
                const block = await getLatestBlockNumber();
                setBlockNumber(block.toString());
            } catch (e) {
                console.warn('Could not fetch block number:', e);
            }
            setError(null);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const id = setInterval(() => fetchData(), POLLING_INTERVAL);
        return () => clearInterval(id);
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 space-y-14">

            {/* Hero */}
            <section className="space-y-6">
                <HeroBanner
                    chainId={currentNetwork.displayChainId}
                    epochInfo={networkStats?.epochInfo ?? null}
                    blockNumber={blockNumber}
                />

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

                <HeroStats
                    epochInfo={networkStats?.epochInfo ?? null}
                    blockNumber={blockNumber}
                    isLoading={isLoading}
                />
            </section>

            {/* Live Metrics */}
            <section className="space-y-4">
                <SectionHeader
                    accent="primary"
                    title="Live Metrics"
                    subtitle="Streaming directly from the network — updates every 10–15s"
                />
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 stagger-children">
                    <GasTracker />
                    <BlockTimeChart />
                    <TpsGauge />
                    <NetworkHealth />
                    <EpochProgress epochInfo={networkStats?.epochInfo ?? null} />
                </div>
            </section>

            {/* My Node + Stake Distribution */}
            <section className="grid gap-6 lg:grid-cols-2">
                {owner ? (
                    <MyNodeCard
                        ownerAddress={owner}
                        validators={networkStats?.validators ?? []}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className="glass border border-dashed border-white/10 rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                            <Sparkles className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Run a node?</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Set <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono">NEXT_PUBLIC_OWNER_VALIDATOR</code> in <code>.env.local</code> to feature your validator here.
                            </p>
                        </div>
                    </div>
                )}
                <StakeDistribution validators={networkStats?.validators ?? []} />
            </section>

            {/* Recent Activity */}
            <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                    <SectionHeader
                        accent="primary"
                        title="Recent Blocks"
                        viewAllHref="/blocks"
                    />
                    <RecentBlocksWidget limit={8} />
                </div>
                <div className="space-y-3">
                    <SectionHeader
                        accent="accent"
                        title="Recent Transactions"
                        viewAllHref="/txs"
                    />
                    <RecentTxsWidget limit={8} />
                </div>
            </section>

            {/* Alerts */}
            <AlertSection validators={networkStats?.validators ?? []} />

            {/* Resources */}
            <section className="space-y-4">
                <SectionHeader
                    accent="muted"
                    title="Official Resources"
                    subtitle="Connect, earn points, and learn the protocol"
                />
                <LinksSection />
            </section>
        </main>
    );
}
