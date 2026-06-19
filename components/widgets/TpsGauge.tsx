"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';
import { getRecentBlocks, getBlockWithTransactions } from '@/lib/explorer-rpc';

const POLL_MS = 15_000;
const WINDOW_BLOCKS = 8;

export function TpsGauge() {
    const [tps, setTps] = useState<number | null>(null);
    const [latestBlock, setLatestBlock] = useState<bigint | null>(null);

    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const heads = await getRecentBlocks(WINDOW_BLOCKS);
                if (heads.length < 2) return;
                const full = await Promise.all(heads.map(h => getBlockWithTransactions(h.number!)));
                const totalTx = full.reduce(
                    (a, b) => a + (Array.isArray(b.transactions) ? b.transactions.length : 0),
                    0
                );
                const oldest = full[full.length - 1].timestamp!;
                const newest = full[0].timestamp!;
                const span = Number(newest - oldest) || 1;
                if (!cancelled) {
                    setTps(totalTx / span);
                    setLatestBlock(heads[0].number!);
                }
            } catch (e) {
                console.warn('[tps] failed', e);
            }
        };
        tick();
        const id = setInterval(tick, POLL_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    return (
        <Card className="glass glass-hover card-lift border-white/5">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/20">
                                <Zap className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                TPS
                            </p>
                        </div>
                        {tps === null ? (
                            <Skeleton className="h-8 w-24 mt-2 bg-white/5" />
                        ) : (
                            <p className="text-2xl font-black tracking-tighter mt-1.5">
                                {tps.toFixed(2)}
                                <span className="text-[10px] text-muted-foreground font-bold ml-1.5">TX / S</span>
                            </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {latestBlock ? `rolling over last ${WINDOW_BLOCKS} blocks` : 'measuring…'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
