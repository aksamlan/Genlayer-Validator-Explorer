"use client";

import { useEffect, useState } from 'react';
import { Box, Activity, Shield } from 'lucide-react';
import { getLatestBlockNumber } from '@/lib/explorer-rpc';
import { fmtNumber } from '@/lib/format';
import type { EpochInfo } from '@/types/validator';

interface HeroBannerProps {
    chainId: number;
    epochInfo: EpochInfo | null;
    blockNumber: string;
}

export function HeroBanner({ chainId, epochInfo, blockNumber }: HeroBannerProps) {
    const [displayBlock, setDisplayBlock] = useState<string>(blockNumber);

    useEffect(() => {
        if (blockNumber !== displayBlock) {
            setDisplayBlock(blockNumber);
        }
    }, [blockNumber, displayBlock]);

    // Live block ticker — refreshes every ~6s
    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const b = await getLatestBlockNumber();
                if (!cancelled) setDisplayBlock(b.toString());
            } catch { /* ignore */ }
        };
        const id = setInterval(tick, 6000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 hero-band">
            <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none animate-pulse-slow" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl pointer-events-none animate-pulse-slow" />

            <div className="relative p-8 sm:p-10 lg:p-14 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
                <div className="space-y-5">
                    <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border-primary/30 bg-primary/10 w-fit">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                            Live · Chain {chainId} · Rally Testnet
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95]">
                        <span className="text-gradient-warm">GenLayer</span>
                        <br />
                        <span className="text-foreground/95">Asimov Network</span>
                    </h1>

                    <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                        Real-time block, transaction, and validator explorer for the <span className="text-foreground font-bold">GenLayer Asimov / Rally Testnet</span>.
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                        <HeroChip icon={Box} label="Blocks" href="/blocks" />
                        <HeroChip icon={Activity} label="Transactions" href="/txs" />
                        <HeroChip icon={Shield} label="Validators" href="/validators" />
                    </div>
                </div>

                {/* Live counter card */}
                <div className="glass card-lift rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                    <p className="text-[10px] uppercase font-black tracking-[0.25em] text-muted-foreground">
                        Latest Block
                    </p>
                    <p className="text-4xl sm:text-5xl font-black tracking-tighter font-mono text-gradient-warm mt-2 break-all">
                        {fmtNumber(BigInt(displayBlock || '0'))}
                    </p>
                    <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                        <Stat label="Active" value={epochInfo?.activeValidators ?? 0} accent="primary" />
                        <Stat label="Total" value={epochInfo?.totalValidators ?? 0} accent="accent" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function HeroChip({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) {
    return (
        <a
            href={href}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-black uppercase tracking-widest text-foreground/80 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        >
            <Icon className="h-3 w-3" />
            {label}
        </a>
    );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: 'primary' | 'accent' }) {
    const color = accent === 'primary' ? 'text-primary' : 'text-accent';
    return (
        <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{label}</p>
            <p className={`text-2xl font-black tracking-tighter mt-1 ${color}`}>
                {value.toLocaleString()}
            </p>
        </div>
    );
}
